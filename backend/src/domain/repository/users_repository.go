package repository

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
)

type UsersRepository interface {
	Find(id uint) (*entity.User, error)
	Save(model.User) (*entity.User, error)
	FindByUserName(userName string) (*entity.User, error)
}
