package utils

import  (
  "bytes"
  "github.com/gin-gonic/gin"
)

type HttpBodyWriter struct {
    gin.ResponseWriter
    Body *bytes.Buffer
}

func (w HttpBodyWriter) Write(b []byte) (int, error) {
    w.Body.Write(b)
    return w.ResponseWriter.Write(b)
}
