package usecase

import (
	"fmt"
	"proto-pulse-plat/domain/repository"
)

type PostUsecase interface {
	DeletePost(postID int) error
}

type postUsecase struct {
	postRepo repository.PostRepository
}

func NewPostUsecase(postRepo repository.PostRepository) PostUsecase {
	return &postUsecase{
		postRepo: postRepo,
	}
}

func (u *postUsecase) DeletePost(postID int) error {
	if postID <= 0 {
		return fmt.Errorf("invalid post ID: %d", postID)
	}

	if err := u.postRepo.Delete(postID); err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	return nil
}
