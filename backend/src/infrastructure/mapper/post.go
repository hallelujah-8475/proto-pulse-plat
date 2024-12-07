package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelPost(title, content string, userID uint) model.Post {
	return model.Post{
		Title:   title,
		Content: content,
		UserID:  int(userID),
	}
}
