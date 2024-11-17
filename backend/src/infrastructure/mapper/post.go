package mapper

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

func ToModel(title, content, fileName string, userID uint) model.Post {
	return model.Post{
		Title:    title,
		Content:  content,
		FileName: fileName,
		UserID:   int(userID),
	}
}

func ToEntity(post postgres.Post) *entity.Post {
	return &entity.Post{
		ID:        post.ID,
		Title:     post.Title,
		Content:   post.Content,
		FileName:  post.FileName,
		FilePath:  post.FilePath,
		UserID:    post.UserID,
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt,
		User: entity.User{
			ID:        post.User.ID,
			UserName:  post.User.UserName,
			AccountID: post.User.AccountID,
			IconURL:   post.User.IconURL,
		},
	}
}
