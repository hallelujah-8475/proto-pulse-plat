package handler

import (
	"net/http"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/helper"
)

type PostHandler struct {
	PostUsecase usecase.PostUsecase
}

func NewPostHandler(
	postUsecase usecase.PostUsecase,
) *PostHandler {
	return &PostHandler{
		PostUsecase: postUsecase,
	}
}

func (oc *PostHandler) GetPostList(w http.ResponseWriter, r *http.Request) {
	postList, err := oc.PostUsecase.List(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed GetPostList", http.StatusInternalServerError)
	}

	err = helper.WriteResponse(w, postList)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed WriteResponse", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	err := oc.PostUsecase.Delete(r)
	if err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (oc *PostHandler) AddPost(w http.ResponseWriter, r *http.Request) {
	err := oc.PostUsecase.Add(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed to add post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (oc *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	postDetail, err := oc.PostUsecase.GetPost(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed GetPost", http.StatusInternalServerError)
	}

	err = helper.WriteResponse(w, postDetail)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed WriteResponse", http.StatusInternalServerError)
	}
}

func (oc *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	err := oc.PostUsecase.Update(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed to update post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
