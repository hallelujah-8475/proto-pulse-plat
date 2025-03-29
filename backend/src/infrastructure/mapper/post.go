package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelPost(title, content, contentTitle, location string, userID uint) model.Post {
	return model.Post{
		Title:        title,
		Content:      content,
		ContentTitle: contentTitle,
		Location:     location,
		UserID:       int(userID),
	}
}
