package response

type Post struct {
	ID uint `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	PostImageBase64  string    `json:"post_image_base64"`
	UserName  string    `json:"user_name"`
	AccountID    uint      `json:"account_id"`
	IconImageBase64      string      `json:"icon_image_base64"`
}

type PostList struct {
	Posts []Post `json:"posts"`
	TotalCount int64 `json:"total_count"`
	Page int `json:"page"`
	PerPage int `json:"per_page"`
}