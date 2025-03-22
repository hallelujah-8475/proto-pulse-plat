package helper

import (
	"encoding/base64"
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/response"
)

func BuildUserResponse(
	user entity.User,
) *response.User {
	return &response.User{
		ID:        user.ID,
		UserName:  user.UserName,
		AccountID: user.AccountID,
		IconImageBase64: fmt.Sprintf(
			"data:%s;base64,%s",
			getImageBase64(user.IconFileName),
			base64.StdEncoding.EncodeToString(user.IconData)),
	}
}
