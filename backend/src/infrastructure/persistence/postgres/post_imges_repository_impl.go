package postgres

import (
	"errors"
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"time"

	"gorm.io/gorm"
)

type GormPostImagesRepository struct {
	DB *gorm.DB
}

type PostImage struct {
	ID        uint   `gorm:"primaryKey"`
	FileName  string `gorm:"size:255"`
	FilePath  string `gorm:"size:255"`
	PostID    uint   `gorm:"not null"`
	Post      Post   `gorm:"foreignKey:UserID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewGormPostImagesRepository(db *gorm.DB) *GormPostImagesRepository {
	return &GormPostImagesRepository{
		DB: db,
	}
}

func (r *GormPostImagesRepository) FindByPostID(postID uint) ([]entity.PostImage, error) {
	var postImages []entity.PostImage

	result := r.DB.Debug().Where("post_id = ?", postID).Find(&postImages)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("no images found for post with id: %d", postID)
		}
		return nil, fmt.Errorf("failed to retrieve images for post ID %d: %w", postID, result.Error)
	}

	r.DB.Model(&entity.Post{})

	return postImages, nil
}

func (r *GormPostImagesRepository) Save(postImage model.PostImage) error {
	result := r.DB.Create(&postImage)
	if result.Error != nil {
		return fmt.Errorf("failed to save postImage: %w", result.Error)
	}

	return nil
}
