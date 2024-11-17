package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/helper"
	"strconv"
)

type PostHandler struct {
	PostUsecase usecase.PostUsecase
}

func NewPostHandler(postUsecase usecase.PostUsecase) *PostHandler {
	return &PostHandler{
		PostUsecase: postUsecase,
	}
}

type DeletePostRequest struct {
	PostID int `json:"post_id"`
}

func (oc *PostHandler) List(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	perPageStr := r.URL.Query().Get("perPage")

	responsePosts, totalCount, page, perPage, err := oc.PostUsecase.List(pageStr, perPageStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"posts":       responsePosts,
		"total_count": totalCount,
		"page":        page,
		"per_page":    perPage,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req DeletePostRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	fmt.Printf("Post ID to delete: %d\n", req.PostID)

	if err := oc.PostUsecase.Delete(req.PostID); err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Post %d deleted successfully", req.PostID)))
}

func (oc *PostHandler) Add(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	if title == "" {
		http.Error(w, "Title field is required", http.StatusBadRequest)
		return
	}

	content := r.FormValue("content")
	if content == "" {
		http.Error(w, "Content field is required", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files[]"]
	if len(files) == 0 {
		http.Error(w, "At least one file is required", http.StatusBadRequest)
		return
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			http.Error(w, "Failed to open file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		err = helper.UploadFileToS3(file, fileHeader.Filename)
		if err != nil {
			return
		}
	}

	if err := oc.PostUsecase.Add(title, content, "multiple files uploaded", 10); err != nil {
		http.Error(w, "Failed to add post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (oc *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		http.Error(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid Post ID", http.StatusBadRequest)
		return
	}

	post, err := oc.PostUsecase.GetByID(postID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	responsePost := map[string]interface{}{
		"id":        post.ID,
		"content":   post.Content,
		"file_name": post.FileName,
		"file_path": post.FilePath,
		"user_id":   post.UserID,
		"user": map[string]interface{}{
			"id":         post.User.ID,
			"user_name":  post.User.UserName,
			"account_id": post.User.AccountID,
			"icon_url":   post.User.IconURL,
		},
		"created_at": post.CreatedAt,
		"updated_at": post.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responsePost); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		http.Error(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid Post ID format", http.StatusBadRequest)
		return
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form data", http.StatusBadRequest)
		return
	}

	content := r.FormValue("content")
	if content == "" {
		http.Error(w, "Content is required", http.StatusBadRequest)
		return
	}

	var file multipart.File
	var fileHeader *multipart.FileHeader
	file, fileHeader, err = r.FormFile("file")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}

	if fileHeader != nil {
		defer file.Close()

		if fileHeader == nil {
			http.Error(w, "No file uploaded", http.StatusBadRequest)
			return
		}
		fmt.Println("File uploaded:", fileHeader.Filename)
	}

	if err := oc.PostUsecase.Update(postID, content, ""); err != nil {
		http.Error(w, "Failed to update post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Post %d updated successfully", postID)))
}
