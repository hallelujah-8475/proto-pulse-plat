package validation

import (
	"fmt"
	"mime/multipart"
	"net/http"
)

func ValidateFormInputs(r *http.Request) (string, string, string, string, []*multipart.FileHeader, error) {
	title := r.FormValue("title")
	if title == "" {
		return "", "", "", "", nil, fmt.Errorf("Title field is required")
	}

	content := r.FormValue("content")
	if content == "" {
		return "", "", "", "", nil, fmt.Errorf("Content field is required")
	}

	files := r.MultipartForm.File["files[]"]
	if len(files) == 0 {
		return "", "", "", "", nil, fmt.Errorf("Files[] field is required")
	}

	contentTitle := r.FormValue("content_title")
	if content == "" {
		return "", "", "", "", nil, fmt.Errorf("content_title field is required")
	}

	location := r.FormValue("location")
	if location == "" {
		return "", "", "", "", nil, fmt.Errorf("location field is required")
	}

	return title, content, contentTitle, location, files, nil
}
