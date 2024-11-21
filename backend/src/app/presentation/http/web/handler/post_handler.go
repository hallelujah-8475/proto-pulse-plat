package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/app/presentation/http/web/validation"
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

func (oc *PostHandler) GetPostList(w http.ResponseWriter, r *http.Request) {
	pageStr, perPageStr := helper.PostListQueryParams(r)

	responsePosts, totalCount, page, perPage, err := oc.PostUsecase.List(pageStr, perPageStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := helper.WriteResponse(w, helper.BuildPostListResponse(responsePosts, totalCount, page, perPage)); err != nil {
		helper.WriteErrorResponse(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	err := helper.ValidateMethod(r, http.MethodPost)
	if err != nil {
		log.Println(err)
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

	if err := oc.PostUsecase.Delete(req.PostID); err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (oc *PostHandler) AddPost(w http.ResponseWriter, r *http.Request) {
	err := helper.ValidateMethod(r, http.MethodPost)
	if err != nil {
		log.Println(err)
		return
	}

	err = helper.ParseMultipart(r)
	if err != nil {
		log.Println(err)
		return
	}

	title, content, files, err := validation.ValidateFormInputs(r)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = oc.PostUsecase.FileUploads(files)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed to upload files", http.StatusInternalServerError)
		return
	}

	if err := oc.PostUsecase.Add(title, content, "multiple files uploaded", 10); err != nil {
		helper.WriteErrorResponse(w, "Failed to add post", http.StatusInternalServerError)
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

	// postImages, err := oc.PostUsecase.GetPostImages(postID)
	// if err != nil {
	// 	http.Error(w, "GetPostImages error", http.StatusBadRequest)
	// 	return
	// }

	if err := helper.WriteResponse(w, helper.BuildPostResponse(post)); err != nil {
		helper.WriteErrorResponse(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	err := helper.ValidateMethod(r, http.MethodPut)
	if err != nil {
		log.Println(err)
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
}
