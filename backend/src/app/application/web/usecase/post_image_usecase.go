package usecase

import (
	"errors"
	"fmt"
	"mime/multipart"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/infrastructure/mapper"
)

type PostImageUsecase interface {
	GetByPostID(postID uint) ([]entity.PostImage, error)
	Add(files []*multipart.FileHeader, postID uint) error
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

func (u *postImageUsecase) Add(files []*multipart.FileHeader, postID uint) error {
	if files == nil {
		return errors.New("files is nil")
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return fmt.Errorf("failed to open file: %w", err)
		}
		defer file.Close()

		if err := u.postImageRepo.Save(mapper.ToModelPostImage(fileHeader.Filename, postID)); err != nil {
			return fmt.Errorf("failed to save post: %w", err)
		}
	}

	return nil
}
