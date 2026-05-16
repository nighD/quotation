package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SaveUploadedFile saves a multipart file to the given directory and returns the relative path.
func SaveUploadedFile(file *multipart.FileHeader, storagePath string, allowedTypes []string, maxSizeMB int64) (string, error) {
	// Validate file size
	if file.Size > maxSizeMB*1024*1024 {
		return "", fmt.Errorf("file size exceeds %dMB limit", maxSizeMB)
	}

	// Validate content type
	contentType := file.Header.Get("Content-Type")
	if !isAllowedType(contentType, allowedTypes) {
		return "", fmt.Errorf("file type %s is not allowed", contentType)
	}

	// Create dated sub-directory
	dateDir := time.Now().Format("2006/01/02")
	dir := filepath.Join(storagePath, dateDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := uuid.New().String() + ext
	fullPath := filepath.Join(dir, filename)

	// Open source file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Write to disk
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	buf := make([]byte, 32*1024)
	for {
		n, err := src.Read(buf)
		if n > 0 {
			if _, werr := dst.Write(buf[:n]); werr != nil {
				return "", fmt.Errorf("failed to write file: %w", werr)
			}
		}
		if err != nil {
			break
		}
	}

	// Return relative path (for storing in DB)
	relativePath := filepath.Join(dateDir, filename)
	return relativePath, nil
}

func isAllowedType(contentType string, allowed []string) bool {
	for _, t := range allowed {
		if strings.TrimSpace(t) == contentType {
			return true
		}
	}
	return false
}
