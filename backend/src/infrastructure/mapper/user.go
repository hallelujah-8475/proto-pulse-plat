package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelUser(userName, accountID, iconFileName string) model.User {
	return model.User{
		UserName: userName,
		AccountID: accountID,
		IconFileName: iconFileName,
	}
}
