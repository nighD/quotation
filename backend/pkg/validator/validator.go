package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validator wraps the go-playground validator.
var validate = validator.New()

// ValidationError represents a single field validation error.
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Validate validates a struct and returns formatted errors.
func Validate(s interface{}) []ValidationError {
	var errors []ValidationError

	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	for _, e := range err.(validator.ValidationErrors) {
		errors = append(errors, ValidationError{
			Field:   toSnakeCase(e.Field()),
			Message: formatMessage(e),
		})
	}

	return errors
}

// HasErrors returns true if there are validation errors.
func HasErrors(errs []ValidationError) bool {
	return len(errs) > 0
}

func formatMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", toSnakeCase(e.Field()))
	case "email":
		return "must be a valid email address"
	case "min":
		return fmt.Sprintf("must be at least %s characters", e.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", e.Param())
	case "oneof":
		return fmt.Sprintf("must be one of: %s", e.Param())
	case "uuid4":
		return "must be a valid UUID"
	case "url":
		return "must be a valid URL"
	case "numeric":
		return "must be a numeric value"
	default:
		return fmt.Sprintf("invalid value for %s", toSnakeCase(e.Field()))
	}
}

func toSnakeCase(s string) string {
	var result strings.Builder
	for i, c := range s {
		if i > 0 && c >= 'A' && c <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(c)
	}
	return strings.ToLower(result.String())
}
