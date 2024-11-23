package usecase

import (
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
)

type PostImageUsecase interface {
	GetByPostID(postID uint) ([]entity.PostImage, error)
}

type postImageUsecase struct {
	postImageRepo repository.PostImagesRepository
}

func NewPostImageUsecase(postImageRepo repository.PostImagesRepository) PostImageUsecase {
	return &postImageUsecase{
		postImageRepo: postImageRepo,
	}
}

func (u *postImageUsecase) GetByPostID(postID uint) ([]entity.PostImage, error) {
	return u.postImageRepo.FindByPostID(postID)
}
