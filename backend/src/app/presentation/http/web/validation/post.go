package validation

import (
	"fmt"
	"mime/multipart"
	"net/http"
)

func ValidateFormInputs(r *http.Request) (string, string, string, []*multipart.FileHeader, error) {
	id := r.FormValue("id")
	if id == "" {
		return "", "", "", nil, fmt.Errorf("Title field is required")
	}

	title := r.FormValue("title")
	if title == "" {
		return "", "", "", nil, fmt.Errorf("Title field is required")
	}

	content := r.FormValue("content")
	if content == "" {
		return "", "", "", nil, fmt.Errorf("Content field is required")
	}

	files := r.MultipartForm.File["files[]"]
	if len(files) == 0 {
		return "", "", "", nil, fmt.Errorf("Files[] field is required")
	}

	return id, title, content, files, nil
}
