package postgres

import (
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"time"

	"gorm.io/gorm"
)

type GormUsersRepository struct {
	DB *gorm.DB
}

type User struct {
	ID           uint   `gorm:"primaryKey"`
	UserName     string `gorm:"size:50"`
	AccountID    string `gorm:"size:50;unique"`
	IconFileName string `gorm:"size:255"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func ToEntityUser(user User) *entity.User {
	return &entity.User{
		ID:           user.ID,
		UserName:     user.UserName,
		AccountID:    user.AccountID,
		IconFileName: user.IconFileName,
	}
}

func NewGormUsersRepository(db *gorm.DB) *GormUsersRepository {
	return &GormUsersRepository{
		DB: db,
	}
}

func (r *GormUsersRepository) Find(id uint) (*entity.User, error) {
	var user User

	result := r.DB.Debug().First(&user, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found with id: %d", id)
		}
		return nil, fmt.Errorf("failed to retrieve user by ID: %w", result.Error)
	}

	return ToEntityUser(user), nil
}

func (r *GormUsersRepository) Save(user model.User) (*entity.User, error) {
	newUser := User{
		UserName:     user.UserName,
		AccountID:    user.AccountID,
		IconFileName: user.IconFileName,
	}

	result := r.DB.Create(&newUser)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to save user: %w", result.Error)
	}

	return ToEntityUser(newUser), nil
}
