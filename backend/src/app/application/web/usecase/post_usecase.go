package usecase

import (
	"errors"
	"fmt"
	"mime/multipart"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/helper"
	"proto-pulse-plat/infrastructure/mapper"
	"proto-pulse-plat/infrastructure/model"
	"strconv"
	"time"
)

type PostUsecase interface {
	List(pageStr, perPageStr string) ([]entity.Post, int64, int, int, error)
	Delete(postID int) error
	Add(title, content, fileName string, userID uint) error
	GetByID(postID int) (*entity.Post, error)
	Update(postID int, content, fileName string) error
	FileUploads(files []*multipart.FileHeader) error
	// GetUserIcon(iconURL string) ([]byte, error)
}

type postUsecase struct {
	postRepo repository.PostRepository
}

func NewPostUsecase(postRepo repository.PostRepository) PostUsecase {
	return &postUsecase{
		postRepo: postRepo,
	}
}

func (u *postUsecase) List(pageStr, perPageStr string) ([]entity.Post, int64, int, int, error) {
	page := 1
	perPage := 8

	if pageStr != "" {
		p, err := strconv.Atoi(pageStr)
		if err == nil && p > 0 {
			page = p
		}
	}
	if perPageStr != "" {
		pp, err := strconv.Atoi(perPageStr)
		if err == nil && pp > 0 {
			perPage = pp
		}
	}

	offset := (page - 1) * perPage

	posts, totalCount, err := u.postRepo.FindAllWithPagination(perPage, offset)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	return posts, totalCount, page, perPage, nil
}

func (u *postUsecase) Delete(postID int) error {
	if postID <= 0 {
		return fmt.Errorf("invalid post ID: %d", postID)
	}

	if err := u.postRepo.Delete(postID); err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	return nil
}

func (u *postUsecase) Add(title, content, fileName string, userID uint) error {
	if content == "" {
		return errors.New("content cannot be empty")
	}

	if err := u.postRepo.Save(mapper.ToModelPost(title, content, fileName, userID)); err != nil {
		return fmt.Errorf("failed to save post: %w", err)
	}

	return nil
}

func (u *postUsecase) GetByID(postID int) (*entity.Post, error) {
	if postID <= 0 {
		return nil, fmt.Errorf("invalid post ID: %d", postID)
	}

	post, err := u.postRepo.FindByID(postID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get post by ID: %w", err)
	}

	return mapper.ToEntityPost(post), nil
}

func (uc *postUsecase) Update(postID int, content, fileName string) error {
	postEntity, err := uc.postRepo.FindByID(postID)
	if err != nil {
		return fmt.Errorf("could not find post with id %d: %w", postID, err)
	}

	post := model.Post{
		ID:        postID,
		Content:   content,
		FileName:  fileName,
		UserID:    int(postEntity.UserID),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := uc.postRepo.Update(post); err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	return nil
}

func (uc *postUsecase) FileUploads(files []*multipart.FileHeader) error {
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return fmt.Errorf("failed to open file: %w", err)
		}
		defer file.Close()

		if err := helper.UploadFileToS3(file, fileHeader.Filename); err != nil {
			return fmt.Errorf("failed to upload file: %w", err)
		}
	}
	return nil
}
