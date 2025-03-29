package model

import "time"

type Post struct {
	ID           int       `json:"id"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	ContentTitle string    `json:"content_title"`
	Location     string    `json:"location"`
	UserID       int       `json:"user_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
