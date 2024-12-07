package usecase

import (
	"errors"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/infrastructure/mapper"
)

type UserUsecase interface {
	Add(userName, accountID, iconFileName string) (*entity.User, error)
}

type userUsecase struct {
	userRepo repository.UsersRepository
}

func NewUserUsecase(userRepo repository.UsersRepository) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

func (u *userUsecase) Add(userName, accountID, iconFileName string) (*entity.User, error) {
	if userName == "" {
		return nil, errors.New("userName cannot be empty")
	}

	user, err := u.userRepo.Save(mapper.ToModelUser(userName, accountID, iconFileName))
	if err != nil {
		return nil, errors.New("failed to save user")
	}

	return user, nil
}