package mapper

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

func ToModelUser(userName, accountID, iconFileName string) model.User {
	return model.User{
		UserName: userName,
		AccountID: accountID,
		IconFileName: iconFileName,
	}
}

func ToEntityUser(user postgres.User) *entity.User {
	return &entity.User{
		ID:           user.ID,
		UserName:     user.UserName,
		AccountID:    user.AccountID,
		IconFileName: user.IconFileName,
	}
}
