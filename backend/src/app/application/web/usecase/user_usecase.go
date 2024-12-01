package usecase

import (
	"errors"
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/infrastructure/mapper"
)

type UserUsecase interface {
	GetByID(userID uint) (*entity.User, error)
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

func (u *userUsecase) GetByID(userID uint) (*entity.User, error) {
	if userID <= 0 {
		return nil, fmt.Errorf("invalid post ID: %d", userID)
	}

	user, err := u.userRepo.Find(userID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get post by ID: %w", err)
	}

	return mapper.ToEntityUser(user), nil
}

func (u *userUsecase) Add(userName, accountID, iconFileName string) (*entity.User, error) {
	if userName == "" {
		return nil, errors.New("userName cannot be empty")
	}

	user, err := u.userRepo.Save(mapper.ToModelUser(userName, accountID, iconFileName))
	if err != nil {
		return nil, errors.New("failed to save user")
	}

	return mapper.ToEntityUser(user), nil
}