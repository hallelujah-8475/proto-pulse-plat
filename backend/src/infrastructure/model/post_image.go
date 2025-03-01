package model

import "time"

type PostImage struct {
	ID        uint      `json:"id"`
	FileName  string    `json:"file_name"`
	PostID    uint      `json:"post_id"`
	Data      []byte    `json:"data"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
