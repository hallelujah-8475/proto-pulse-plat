package repository

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
)

type PostRepository interface {
	Delete(postID int) error
	FindAllWithPagination(limit int, offset int, title string) ([]entity.Post, int64, error)
	Save(model.Post) (*entity.Post, error)
	FindByID(postID int) (*entity.Post, error)
	Update(model.Post) error
}
