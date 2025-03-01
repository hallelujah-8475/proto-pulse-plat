package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelUser(userName, accountID, iconFileName string, iconData []byte) model.User {
	return model.User{
		UserName:     userName,
		AccountID:    accountID,
		IconFileName: iconFileName,
		IconData:     iconData,
	}
}
