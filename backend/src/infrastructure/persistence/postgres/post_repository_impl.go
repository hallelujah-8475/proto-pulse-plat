package postgres

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type GormPostRepository struct {
	DB *gorm.DB
}

type Post struct {
	ID        uint   `gorm:"primaryKey"`
	Content   string `gorm:"type:text"`
	FileName  string `gorm:"size:255"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewGormPostRepository(db *gorm.DB) *GormPostRepository {
	return &GormPostRepository{
		DB: db,
	}
}

func (r *GormPostRepository) Delete(postID int) error {
	result := r.DB.Delete(&Post{}, postID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete post: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("no post found with id: %d", postID)
	}

	return nil
}
