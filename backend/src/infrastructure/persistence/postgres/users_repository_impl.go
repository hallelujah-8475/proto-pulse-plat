package postgres

import (
	"time"

	"gorm.io/gorm"
)

type GormUsersRepository struct {
	DB *gorm.DB
}

type Users struct {
	ID        uint   `gorm:"primaryKey"`
	UserName  string `gorm:"size:50"`
	AccountID string `gorm:"size:50;unique"`
	IconURL   string `gorm:"size:255"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Posts     []Post `gorm:"foreignKey:UserID"`
}
