package mapper

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

func ToModelPostImage(fileName string, postID uint) model.PostImage {
	return model.PostImage{
		FileName: fileName,
		PostID: postID,
	}
}

func ToEntityPostImage(postImage postgres.PostImage) *entity.PostImage {
	return &entity.PostImage{
		ID:       postImage.ID,
		FileName: postImage.FileName,
		PostID:   postImage.PostID,
	}
}
