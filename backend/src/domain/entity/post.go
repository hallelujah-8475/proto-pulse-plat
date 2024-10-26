package entity

import "time"

type Post struct {
	ID        uint   `gorm:"primaryKey"`
	Content   string `gorm:"type:text"`
	FileName  string `gorm:"type:varchar(255)"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"foreignKey:UserID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
