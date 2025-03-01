package model

type User struct {
	ID           uint   `gorm:"primaryKey"`
	UserName     string `json:"user_name"`
	AccountID    string `json:"account_id"`
	IconFileName string `json:"icon_file_name"`
	IconData     []byte `json:"icon_data"`
}
