package entity

import (
	"time"
)

type User struct {
	ID        uint   `gorm:"primaryKey"`
	UserName  string `gorm:"size:50"`
	AccountID string `gorm:"size:50;unique"`
	IconFileName   string `gorm:"size:255"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Posts     []Post `gorm:"foreignKey:UserID"`
}
