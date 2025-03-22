package handler

import (
	"net/http"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/helper"
)

type UserHandler struct {
	UserUsecase usecase.UserUsecase
}

func NewUserHandler(
	userUsecase usecase.UserUsecase,
) *UserHandler {
	return &UserHandler{
		UserUsecase: userUsecase,
	}
}

func (h *UserHandler) Find(w http.ResponseWriter, r *http.Request) {
	user, err := h.UserUsecase.Find(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed GetPost", http.StatusInternalServerError)
	}

	err = helper.WriteResponse(w, user)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed WriteResponse", http.StatusInternalServerError)
	}
}
