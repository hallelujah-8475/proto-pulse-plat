package entity

import "time"

type Post struct {
	ID        uint   `gorm:"primaryKey"`
	Title  string `gorm:"type:varchar(255)"`
	Content   string `gorm:"type:text"`
	FileName  string `gorm:"type:varchar(255)"`
	FilePath  string `gorm:"type:varchar(255)"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"foreignKey:UserID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
