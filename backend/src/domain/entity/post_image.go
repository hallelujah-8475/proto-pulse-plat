package entity

import (
	"time"
)

type PostImage struct {
	ID        uint   `gorm:"primaryKey"`
	FileName  string `gorm:"type:varchar(255)"`
	PostID    uint   `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
