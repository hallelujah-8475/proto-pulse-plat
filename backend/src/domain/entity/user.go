package entity

import (
	"time"
)

type User struct {
	ID           uint   `gorm:"primaryKey"     json:"id"`
	UserName     string `gorm:"size:50"        json:"user_name"`
	AccountID    string `gorm:"size:50;unique" json:"account_id"`
	IconFileName string `gorm:"size:255"`
	IconData     []byte
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
