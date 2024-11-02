package model

type UserProfile struct {
	Name            string `json:"name"`
	ScreenName      string `json:"screen_name"`
	ProfileImageUrl string `json:"profile_image_url_https"`
}
