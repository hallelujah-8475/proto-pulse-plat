package repository

import (
	"proto-pulse-plat/domain/entity"
)

type PostImagesRepository interface {
	FindByPostID(postID uint) ([]entity.PostImage, error)
}
