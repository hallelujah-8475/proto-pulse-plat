package mapper

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

func ToEntityUser(user postgres.User) *entity.User {
	return &entity.User{
		ID:        user.ID,
		UserName:  user.UserName,
		AccountID: user.AccountID,
		IconFileName:   user.IconFileName,
	}
}
