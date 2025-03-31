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
	ID           uint   `gorm:"primaryKey"`
	Title        string `gorm:"size:255"`
	Content      string `gorm:"type:text"`
	ContentTitle string `gorm:"size:255"`
	Location     string `gorm:"size:255"`
	UserID       uint   `gorm:"not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func ToEntityPost(post Post) *entity.Post {
	return &entity.Post{
		ID:           post.ID,
		Title:        post.Title,
		Content:      post.Content,
		ContentTitle: post.ContentTitle,
		Location:     post.Location,
		UserID:       post.UserID,
		CreatedAt:    post.CreatedAt,
		UpdatedAt:    post.UpdatedAt,
	}
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

func (r *GormPostsRepository) FindAllWithPagination(
    limit int, 
    offset int, 
    title string,
) ([]entity.Post, int64, error) {
	var posts []entity.Post
	var count int64

	query := r.DB.Debug().Model(&entity.Post{})

	if title != "" {
		query = query.Where("title ILIKE ?", "%"+title+"%")
	}

	query.Count(&count)

	result := query.Order("updated_at DESC").Limit(limit).Offset(offset).Find(&posts)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return posts, count, nil
}


func (r *GormPostsRepository) Save(post model.Post) (*entity.Post, error) {
	newPost := Post{
		Title:        post.Title,
		Content:      post.Content,
		ContentTitle: post.ContentTitle,
		Location:     post.Location,
		UserID:       uint(post.UserID),
	}

	result := r.DB.Create(&newPost)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to save post: %w", result.Error)
	}

	return ToEntityPost(newPost), nil
}

func (r *GormPostsRepository) FindByID(postID int) (*entity.Post, error) {
	var post Post

	result := r.DB.First(&post, postID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("post not found with id: %d", postID)
		}
		return nil, fmt.Errorf("failed to retrieve post by ID: %w", result.Error)
	}

	return ToEntityPost(post), nil
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
