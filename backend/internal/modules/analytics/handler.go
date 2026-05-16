package analytics

import (
	"strconv"

	"github.com/baole/quotation/pkg/response"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for analytics/admin.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetDashboard godoc
// @Summary      Admin dashboard
// @Description  Get platform-wide stats
// @Tags         admin
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  response.Response{data=DashboardStats}
// @Router       /admin/dashboard [get]
func (h *Handler) GetDashboard(c *fiber.Ctx) error {
	stats, err := h.service.GetDashboard()
	if err != nil {
		return response.InternalError(c, "Failed to fetch dashboard data")
	}
	return response.OK(c, stats, "")
}

// GetRevenueReport godoc
// @Summary      Revenue report
// @Description  Get daily revenue for the last N days
// @Tags         admin
// @Security     BearerAuth
// @Param        days query int false "Number of days (default 30)"
// @Produce      json
// @Success      200  {object}  response.Response{data=[]RevenueReport}
// @Router       /admin/reports/revenue [get]
func (h *Handler) GetRevenueReport(c *fiber.Ctx) error {
	days, _ := strconv.Atoi(c.Query("days", "30"))

	report, err := h.service.GetRevenueReport(days)
	if err != nil {
		return response.InternalError(c, "Failed to generate revenue report")
	}
	return response.OK(c, report, "")
}

// GetSubscriptionReport godoc
// @Summary      Subscription report
// @Description  Get active subscription breakdown by plan
// @Tags         admin
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  response.Response{data=[]SubscriptionReport}
// @Router       /admin/reports/subscriptions [get]
func (h *Handler) GetSubscriptionReport(c *fiber.Ctx) error {
	report, err := h.service.GetSubscriptionReport()
	if err != nil {
		return response.InternalError(c, "Failed to generate subscription report")
	}
	return response.OK(c, report, "")
}
