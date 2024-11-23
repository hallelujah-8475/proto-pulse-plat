package repository

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
)

type PostImagesRepository interface {
	FindByPostID(postID uint) ([]entity.PostImage, error)
	Save(model.PostImage) error
}
