package model

import "time"

type Post struct {
    ID        int       `json:"id"`
    Content   string    `json:"content"`
    FileName  string    `json:"file_name"`
    UserID    int       `json:"user_id"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
