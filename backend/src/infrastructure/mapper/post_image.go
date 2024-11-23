package mapper

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

func ToEntityPostImage(postImage postgres.PostImage) *entity.PostImage {
	return &entity.PostImage{
		ID:       postImage.ID,
		FileName: postImage.FileName,
		PostID:   postImage.PostID,
	}
}
