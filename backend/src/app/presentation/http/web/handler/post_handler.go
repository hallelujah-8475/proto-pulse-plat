package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"proto-pulse-plat/app/presentation/http/web/handler/application/web/usecase"
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

	if err := oc.PostUsecase.DeletePost(req.PostID); err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Post %d deleted successfully", req.PostID)))
}
