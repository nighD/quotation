package quotation
package main

import (
 "context"
 "log"
 "net/http"
 "os"

 "github.com/aws/aws-sdk-go-v2/config"
 "github.com/aws/aws-sdk-go-v2/service/s3"
)

var s3Client *s3.Client

func init() {
 cfg, err := config.LoadDefaultConfig(context.TODO())
 if err != nil {
  log.Fatal(err)
 }

 s3Client = s3.NewFromConfig(cfg)
}

func streamPDFHandler(w http.ResponseWriter, r *http.Request) {
 bucket := os.Getenv("AWS_BUCKET_NAME")
 key := "pdfs/" + r.URL.Query().Get("file") // ví dụ: ?file=abc.pdf

 rangeHeader := r.Header.Get("Range")

 input := &s3.GetObjectInput{
  Bucket: &bucket,
  Key:    &key,
 }

 // ✅ nếu có range → forward xuống S3
 if rangeHeader != "" {
  input.Range = &rangeHeader
 }

 resp, err := s3Client.GetObject(context.TODO(), input)
 if err != nil {
  http.Error(w, "Error fetching file", http.StatusInternalServerError)
  return
 }
 defer resp.Body.Close()

 // 🔥 headers quan trọng
 w.Header().Set("Content-Type", "application/pdf")
 w.Header().Set("Accept-Ranges", "bytes")
 w.Header().Set("Content-Disposition", "inline")

 // ✅ partial content
 if resp.ContentRange != nil {
  w.Header().Set("Content-Range", *resp.ContentRange)
  w.Header().Set("Content-Length", intToString(resp.ContentLength))
  w.WriteHeader(http.StatusPartialContent) // 206
 } else {
  w.Header().Set("Content-Length", intToString(resp.ContentLength))
  w.WriteHeader(http.StatusOK) // 200
 }

 // 🚀 stream body
 _, err = w.Write(readAll(resp.Body))
 if err != nil {
  log.Println("Write error:", err)
 }
}

// helper
func intToString(n int64) string {
 return fmt.Sprintf("%d", n)
}

func readAll(body io.ReadCloser) []byte {
 data, _ := io.ReadAll(body)
 return data
}

func main() {
 http.HandleFunc("/pdf", streamPDFHandler)
 log.Println("Server running on :8080")
 http.ListenAndServe(":8080", nil)
}