package usecase

import (
	"errors"
	"net/http"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/helper"
	"proto-pulse-plat/infrastructure/response"
	"strconv"
)

type UserUsecase interface {
	Find(r *http.Request) (*response.User, error)
}

type userUsecase struct {
	userRepo repository.UsersRepository
}

func NewUserUsecase(
	userRepo repository.UsersRepository,
) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

func (u *userUsecase) Find(r *http.Request) (*response.User, error) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		return nil, errors.New("userIDStr is blank")
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		return nil, errors.New("userID is invalid")
	}

	user, err := u.userRepo.Find(uint(userID))
	if err != nil {
		return nil, errors.New("Find occured error")
	}

	return helper.BuildUserResponse(*user), nil
}
