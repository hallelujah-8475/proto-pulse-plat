package postgres

import (
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"time"

	"gorm.io/gorm"
)

type GormPostsRepository struct {
	DB *gorm.DB
}

type Post struct {
	ID        uint   `gorm:"primaryKey"`
	Title     string `gorm:"size:255"`
	Content   string `gorm:"type:text"`
	UserID    uint   `gorm:"not null"`
	// User      User   `gorm:"foreignKey:UserID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewGormPostsRepository(db *gorm.DB) *GormPostsRepository {
	return &GormPostsRepository{
		DB: db,
	}
}

func (r *GormPostsRepository) Delete(postID int) error {
	result := r.DB.Delete(&Post{}, postID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete post: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("no post found with id: %d", postID)
	}

	return nil
}

func (r *GormPostsRepository) FindAllWithPagination(limit int, offset int) ([]entity.Post, int64, error) {
	var posts []entity.Post
	var count int64

	result := r.DB.Limit(limit).Offset(offset).Find(&posts)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	r.DB.Model(&entity.Post{}).Count(&count)

	return posts, count, nil
}


func (r *GormPostsRepository) Save(post model.Post) (Post, error) {
	newPost := Post{
		Title:   post.Title,
		Content: post.Content,
		UserID:  uint(post.UserID),
	}

	result := r.DB.Create(&newPost)
	if result.Error != nil {
		return Post{}, fmt.Errorf("failed to save post: %w", result.Error)
	}

	return newPost, nil
}


func (r *GormPostsRepository) FindByID(postID int) (Post, error) {
	var post Post

	result := r.DB.Debug().Preload("User").First(&post, postID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return Post{}, fmt.Errorf("post not found with id: %d", postID)
		}
		return Post{}, fmt.Errorf("failed to retrieve post by ID: %w", result.Error)
	}

	return post, nil
}

func (r *GormPostsRepository) Update(post model.Post) error {
	result := r.DB.Model(&post).Where("id = ?", post.ID).Updates(post)
	if result.Error != nil {
		return fmt.Errorf("failed to save post: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("no rows updated, post with id %d might not exist", post.ID)
	}

	return nil
}
