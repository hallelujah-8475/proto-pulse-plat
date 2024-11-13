package repository

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

type PostRepository interface {
	Delete(postID int) error
	FindAllWithPagination(limit int, offset int) ([]entity.Post, int64, error)
	Save(model.Post) error
	FindByID(postID int) (postgres.Post, error)
	Update(model.Post) error
}
