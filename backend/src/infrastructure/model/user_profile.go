package model

type UserProfile struct {
	ID              float64 `json:"id"`
	Name            string  `json:"name"`
	ScreenName      string  `json:"screen_name"`
	ProfileImageUrl string  `json:"profile_image_url_https"`
}
