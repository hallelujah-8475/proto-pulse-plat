package entity

import (
	"time"
)

type Post struct {
	ID        uint
	Title     string
	Content   string
	FileName  string
	FilePath  string
	UserID    uint  
	User      User  
	CreatedAt time.Time
	UpdatedAt time.Time
}
