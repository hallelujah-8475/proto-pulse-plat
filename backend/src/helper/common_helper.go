package helper

import (
	"encoding/json"
	"fmt"
	"net/http"
)
const (
	MaxMultipartMemory = 10 << 20 // 10 MB
)

func ValidateMethod(r *http.Request, expectedMethod string) error {
	if r.Method != expectedMethod {
		return fmt.Errorf("method not allowed")
	}
	return nil
}

func ParseMultipart(r *http.Request) error {
	if err := r.ParseMultipartForm(MaxMultipartMemory); err != nil {
		return fmt.Errorf("failed to parse multipart form: %w", err)
	}
	return nil
}

func WriteResponse(w http.ResponseWriter, response map[string]interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}


func WriteErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	http.Error(w, message, statusCode)
}