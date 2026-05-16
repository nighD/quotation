package payments

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/baole/quotation/internal/config"
	"github.com/baole/quotation/internal/modules/subscriptions"
	"github.com/google/uuid"
	stripe "github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
	"github.com/stripe/stripe-go/v78/webhook"
)

// Service handles payment business logic for all gateways.
type Service struct {
	repo     *Repository
	subRepo  *subscriptions.Repository
	cfg      *config.Config
}

func NewService(repo *Repository, subRepo *subscriptions.Repository, cfg *config.Config) *Service {
	stripe.Key = cfg.Stripe.SecretKey
	return &Service{repo: repo, subRepo: subRepo, cfg: cfg}
}

// ─── Create Payment ───────────────────────────────────────────

func (s *Service) CreatePayment(userID string, req *CreatePaymentRequest) (*CreatePaymentResponse, error) {
	uid, _ := uuid.Parse(userID)
	subID, _ := uuid.Parse(req.SubscriptionID)

	p := &Payment{
		UserID:         uid,
		Gateway:        req.Gateway,
		Amount:         req.Amount,
		Currency:       req.Currency,
		Status:         "pending",
		SubscriptionID: &subID,
		Metadata:       "{}",
	}

	if err := s.repo.Create(p); err != nil {
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	var paymentURL string
	var err error

	switch req.Gateway {
	case "stripe":
		paymentURL, err = s.createStripeIntent(p)
	case "momo":
		paymentURL, err = s.createMoMoPayment(p)
	case "vnpay":
		paymentURL, err = s.createVNPayURL(p)
	case "onepay":
		paymentURL, err = s.createOnePayURL(p)
	default:
		return nil, fmt.Errorf("unsupported gateway: %s", req.Gateway)
	}

	if err != nil {
		return nil, err
	}

	return &CreatePaymentResponse{
		PaymentID:  p.ID.String(),
		PaymentURL: paymentURL,
		Gateway:    req.Gateway,
	}, nil
}

// ─── Stripe ───────────────────────────────────────────────────

func (s *Service) createStripeIntent(p *Payment) (string, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(p.Amount * 100)), // Stripe uses smallest currency unit
		Currency: stripe.String(strings.ToLower(p.Currency)),
		Metadata: map[string]string{
			"payment_id": p.ID.String(),
		},
	}

	intent, err := paymentintent.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe: failed to create payment intent: %w", err)
	}

	// Return the client_secret for frontend use (not a redirect URL)
	return intent.ClientSecret, nil
}

func (s *Service) HandleStripeWebhook(payload []byte, sigHeader string) error {
	event, err := webhook.ConstructEvent(payload, sigHeader, s.cfg.Stripe.WebhookSecret)
	if err != nil {
		return fmt.Errorf("stripe: webhook signature verification failed: %w", err)
	}

	switch event.Type {
	case "payment_intent.succeeded":
		// Extract payment_id from metadata and activate subscription
		// event.Data.Object is a map[string]interface{}
		if obj, ok := event.Data.Object["metadata"].(map[string]interface{}); ok {
			if paymentID, ok := obj["payment_id"].(string); ok {
				return s.activateSubscription(paymentID, event.ID)
			}
		}
	case "payment_intent.payment_failed":
		// Handle failed payment
	}

	return nil
}

// ─── MoMo ─────────────────────────────────────────────────────

func (s *Service) createMoMoPayment(p *Payment) (string, error) {
	// MoMo HMAC-SHA256 signature generation
	orderID := p.ID.String()
	requestID := uuid.New().String()
	orderInfo := fmt.Sprintf("Payment %s", orderID)
	amount := int64(p.Amount)

	rawSignature := fmt.Sprintf(
		"accessKey=%s&amount=%d&extraData=&ipnUrl=%s&orderId=%s&orderInfo=%s&orderType=momo_wallet&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=payWithMethod",
		s.cfg.MoMo.AccessKey, amount, s.cfg.MoMo.NotifyURL,
		orderID, orderInfo, s.cfg.MoMo.PartnerCode,
		s.cfg.MoMo.ReturnURL, requestID,
	)

	sig := hmacSHA256(rawSignature, s.cfg.MoMo.SecretKey)
	_ = sig // Would be sent in HTTP POST to MoMo endpoint

	// TODO: POST to s.cfg.MoMo.Endpoint with JSON body and return payUrl from response
	// For now return stub URL
	return fmt.Sprintf("https://test-payment.momo.vn/pay?orderId=%s", orderID), nil
}

func (s *Service) HandleMoMoWebhook(payload *MoMoWebhookPayload) error {
	// Verify MoMo HMAC-SHA256 signature
	rawSignature := fmt.Sprintf(
		"accessKey=%s&amount=%d&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%d&resultCode=%d&transId=%d",
		s.cfg.MoMo.AccessKey, payload.Amount, payload.ExtraData, payload.Message,
		payload.OrderID, payload.OrderInfo, payload.OrderType, payload.PartnerCode,
		payload.PayType, payload.RequestID, payload.ResponseTime,
		payload.ResultCode, payload.TransID,
	)

	expectedSig := hmacSHA256(rawSignature, s.cfg.MoMo.SecretKey)
	if !hmac.Equal([]byte(expectedSig), []byte(payload.Signature)) {
		return fmt.Errorf("momo: invalid webhook signature")
	}

	if payload.ResultCode != 0 {
		// Payment failed
		return nil
	}

	return s.activateSubscription(payload.OrderID, fmt.Sprintf("%d", payload.TransID))
}

// ─── VNPay ────────────────────────────────────────────────────

func (s *Service) createVNPayURL(p *Payment) (string, error) {
	params := url.Values{}
	params.Set("vnp_Version", "2.1.0")
	params.Set("vnp_Command", "pay")
	params.Set("vnp_TmnCode", s.cfg.VNPay.TMNCode)
	params.Set("vnp_Amount", fmt.Sprintf("%d", int64(p.Amount*100)))
	params.Set("vnp_CurrCode", "VND")
	params.Set("vnp_TxnRef", p.ID.String())
	params.Set("vnp_OrderInfo", fmt.Sprintf("Payment %s", p.ID.String()))
	params.Set("vnp_OrderType", "other")
	params.Set("vnp_Locale", "vn")
	params.Set("vnp_ReturnUrl", s.cfg.VNPay.ReturnURL)
	params.Set("vnp_IpAddr", "127.0.0.1")
	params.Set("vnp_CreateDate", time.Now().Format("20060102150405"))

	// Sort params for signature
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var sb strings.Builder
	for i, k := range keys {
		if i > 0 {
			sb.WriteString("&")
		}
		sb.WriteString(k + "=" + params.Get(k))
	}

	signature := hmacSHA512(sb.String(), s.cfg.VNPay.HashSecret)
	params.Set("vnp_SecureHash", signature)

	return s.cfg.VNPay.URL + "?" + params.Encode(), nil
}

func (s *Service) HandleVNPayWebhook(payload *VNPayWebhookPayload) error {
	// Rebuild query string without vnp_SecureHash for signature verification
	// In production: collect all vnp_ params, sort, hash, compare
	if payload.ResponseCode != "00" {
		return nil // Payment not successful
	}

	return s.activateSubscription(payload.TxnRef, payload.TransactionNo)
}

// ─── OnePay ───────────────────────────────────────────────────

func (s *Service) createOnePayURL(p *Payment) (string, error) {
	params := url.Values{}
	params.Set("vpc_Version", "2")
	params.Set("vpc_Command", "pay")
	params.Set("vpc_AccessCode", s.cfg.OnePay.AccessCode)
	params.Set("vpc_Merchant", s.cfg.OnePay.MerchantID)
	params.Set("vpc_Locale", "vn")
	// For testing we will just hardcode return URL if not set
	params.Set("vpc_ReturnURL", s.cfg.App.URL+"/payments/onepay/return")
	params.Set("vpc_CallbackURL", s.cfg.App.URL+"/payments/onepay/ipn")
	params.Set("vpc_MerchTxnRef", p.ID.String())
	params.Set("vpc_OrderInfo", fmt.Sprintf("Payment_%s", p.ID.String()))
	params.Set("vpc_Amount", fmt.Sprintf("%d", int64(p.Amount*100)))
	params.Set("vpc_TicketNo", "127.0.0.1")

	keys := make([]string, 0, len(params))
	for k := range params {
		if strings.HasPrefix(k, "vpc_") || strings.HasPrefix(k, "user_") {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	var sb strings.Builder
	for i, k := range keys {
		if i > 0 {
			sb.WriteString("&")
		}
		sb.WriteString(k + "=" + params.Get(k))
	}

	// Hash Key is usually hex encoded
	keyBytes, err := hex.DecodeString(s.cfg.OnePay.HashKey)
	if err != nil {
		// fallback to bytes if not valid hex
		keyBytes = []byte(s.cfg.OnePay.HashKey)
	}

	h := hmac.New(sha256.New, keyBytes)
	h.Write([]byte(sb.String()))
	signature := strings.ToUpper(hex.EncodeToString(h.Sum(nil)))

	params.Set("vpc_SecureHash", signature)

	return s.cfg.OnePay.PaymentEndpoint + "?" + params.Encode(), nil
}

func (s *Service) HandleOnePayWebhook(params map[string]string) error {
	// Verify signature
	hashReceived := params["vpc_SecureHash"]
	if hashReceived == "" {
		return fmt.Errorf("onepay: missing signature")
	}

	keys := make([]string, 0, len(params))
	for k := range params {
		if k != "vpc_SecureHash" && (strings.HasPrefix(k, "vpc_") || strings.HasPrefix(k, "user_")) {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	var sb strings.Builder
	for i, k := range keys {
		if i > 0 {
			sb.WriteString("&")
		}
		sb.WriteString(k + "=" + params[k])
	}

	keyBytes, err := hex.DecodeString(s.cfg.OnePay.HashKey)
	if err != nil {
		keyBytes = []byte(s.cfg.OnePay.HashKey)
	}

	h := hmac.New(sha256.New, keyBytes)
	h.Write([]byte(sb.String()))
	signature := strings.ToUpper(hex.EncodeToString(h.Sum(nil)))

	if signature != strings.ToUpper(hashReceived) {
		return fmt.Errorf("onepay: invalid webhook signature")
	}

	if params["vpc_TxnResponseCode"] != "0" {
		return fmt.Errorf("onepay: payment failed with code %s", params["vpc_TxnResponseCode"])
	}

	txnRef := params["vpc_MerchTxnRef"]
	txnNo := params["vpc_TransactionNo"]
	
	return s.activateSubscription(txnRef, txnNo)
}

// ─── Shared activation ────────────────────────────────────────

// activateSubscription marks a payment as success and activates the linked subscription.
func (s *Service) activateSubscription(paymentID, transactionID string) error {
	if err := s.repo.UpdateStatus(paymentID, "success", transactionID); err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	// Fetch payment to get subscription ID
	p, err := s.repo.FindByID(paymentID)
	if err != nil {
		return err
	}

	if p.SubscriptionID != nil {
		// Fetch the user subscription which includes the preloaded Plan
		sub, err := s.subRepo.FindSubscriptionByID(p.SubscriptionID.String())
		if err == nil && sub.Plan != nil {
			return s.subRepo.ActivateSubscription(*p.SubscriptionID, time.Now(), time.Now().AddDate(0, 0, sub.Plan.DurationDays))
		}
	}

	return nil
}

// ─── Helpers ──────────────────────────────────────────────────

func hmacSHA256(data, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func hmacSHA512(data, secret string) string {
	h := hmac.New(sha512.New, []byte(secret))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}
