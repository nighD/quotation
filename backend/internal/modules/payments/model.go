package payments

import (
	"time"

	"github.com/google/uuid"
)

// Payment is the GORM model for the payments table.
type Payment struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Gateway       string    `gorm:"type:varchar(50);not null" json:"gateway"`
	Amount        float64   `gorm:"type:decimal(12,2);not null" json:"amount"`
	Currency      string    `gorm:"type:varchar(10);default:'VND'" json:"currency"`
	TransactionID string    `gorm:"type:varchar(255);index" json:"transaction_id"`
	Status        string    `gorm:"type:varchar(50);default:'pending'" json:"status"`
	Metadata      string    `gorm:"type:jsonb" json:"metadata,omitempty"`
	// References
	SubscriptionID *uuid.UUID `gorm:"type:uuid" json:"subscription_id,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// ─── Request DTOs ─────────────────────────────────────────────

type CreatePaymentRequest struct {
	SubscriptionID string  `json:"subscription_id" validate:"required,uuid4"`
	Gateway        string  `json:"gateway" validate:"required,oneof=stripe momo vnpay onepay"`
	Amount         float64 `json:"amount" validate:"required,gt=0"`
	Currency       string  `json:"currency" validate:"omitempty,oneof=VND USD"`
}

// ─── Gateway-specific DTOs ────────────────────────────────────

// StripeWebhookPayload is the raw Stripe webhook event.
type StripeWebhookPayload struct {
	Type string `json:"type"`
}

// MoMoWebhookPayload is the MoMo IPN callback payload.
type MoMoWebhookPayload struct {
	PartnerCode  string `json:"partnerCode"`
	OrderID      string `json:"orderId"`
	RequestID    string `json:"requestId"`
	Amount       int64  `json:"amount"`
	OrderInfo    string `json:"orderInfo"`
	OrderType    string `json:"orderType"`
	TransID      int64  `json:"transId"`
	ResultCode   int    `json:"resultCode"`
	Message      string `json:"message"`
	PayType      string `json:"payType"`
	ResponseTime int64  `json:"responseTime"`
	ExtraData    string `json:"extraData"`
	Signature    string `json:"signature"`
}

// VNPayWebhookPayload is the VNPay IPN callback payload.
type VNPayWebhookPayload struct {
	TmnCode       string `query:"vnp_TmnCode"`
	Amount        string `query:"vnp_Amount"`
	BankCode      string `query:"vnp_BankCode"`
	BankTranNo    string `query:"vnp_BankTranNo"`
	CardType      string `query:"vnp_CardType"`
	PayDate       string `query:"vnp_PayDate"`
	OrderInfo     string `query:"vnp_OrderInfo"`
	TransactionNo string `query:"vnp_TransactionNo"`
	ResponseCode  string `query:"vnp_ResponseCode"`
	TxnRef        string `query:"vnp_TxnRef"`
	SecureHash    string `query:"vnp_SecureHash"`
}

// ─── Response DTOs ────────────────────────────────────────────

type PaymentResponse struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Gateway       string    `json:"gateway"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	TransactionID string    `json:"transaction_id"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

type CreatePaymentResponse struct {
	PaymentID  string `json:"payment_id"`
	PaymentURL string `json:"payment_url"`
	Gateway    string `json:"gateway"`
}

func toResponse(p *Payment) *PaymentResponse {
	return &PaymentResponse{
		ID:            p.ID.String(),
		UserID:        p.UserID.String(),
		Gateway:       p.Gateway,
		Amount:        p.Amount,
		Currency:      p.Currency,
		TransactionID: p.TransactionID,
		Status:        p.Status,
		CreatedAt:     p.CreatedAt,
	}
}
