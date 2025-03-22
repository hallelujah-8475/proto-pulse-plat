package response

type User struct {
	ID              uint   `json:"id"`
	UserName        string `json:"user_name"`
	AccountID       string `json:"account_id"`
	IconImageBase64 string `json:"icon_image_base64"`
}
