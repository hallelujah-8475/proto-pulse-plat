package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"proto-pulse-plat/infrastructure/model"

	"github.com/gorilla/sessions"
)

func (oc *OAuthClient) UserProfile(w http.ResponseWriter, r *http.Request) {
	storeKeyString := os.Getenv("COOKIE_STORE_KEY")
	var store = sessions.NewCookieStore([]byte(storeKeyString))

	session, err := store.Get(r, "auth-session")
	if err != nil {
		http.Error(w, "Unable to retrieve session", http.StatusInternalServerError)
		return
	}

	profile := model.UserProfile{
		ID: session.Values["id"].(float64),
		Name:            session.Values["name"].(string),
		ScreenName:      session.Values["screen_name"].(string),
		ProfileImageUrl: session.Values["profile_image_url_https"].(string),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
