package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/config"
	"proto-pulse-plat/helper"
	"proto-pulse-plat/infrastructure/model"
	"time"

	"github.com/gorilla/sessions"
)

type OAuthClient struct {
	OauthUsecase      usecase.OAuthUsecase
}

func NewOAuthClient(oauthUsecase usecase.OAuthUsecase, xConfig *config.Xconfig) *OAuthClient {
	return &OAuthClient{
		OauthUsecase:      oauthUsecase,
	}
}

func (oc *OAuthClient) OauthCertificate(w http.ResponseWriter, r *http.Request) {
	oauthToken, err := oc.OauthUsecase.GetOAuthToken()
	if err != nil {
		fmt.Println(err)
		return
	}

	req, err := oc.OauthUsecase.MakeOAuthRequest(oauthToken)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	response := map[string]string{"redirectURL": resp.Request.URL.String()}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to send JSON response", http.StatusInternalServerError)
		log.Println("Error encoding JSON response:", err)
	}
}

func (oc *OAuthClient) OauthCallback(w http.ResponseWriter, r *http.Request) {
	params := url.Values{}
	params.Add("oauth_token", r.URL.Query().Get("oauth_token"))
	params.Add("oauth_verifier", r.URL.Query().Get("oauth_verifier"))

	oauthClient, err := oc.OauthUsecase.MakeOAuthClient(params)
	if err != nil {
		fmt.Println("Error MakeOAuthClient:", err)
		return
	}

	resp, err := oc.OauthUsecase.GetOAuthResponse(oauthClient)
	if err != nil {
		fmt.Println("Error verifying credentials:", err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	var profile model.UserProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		fmt.Println("Error parsing JSON:", err)
		return
	}

	tokenString, err := helper.GenerateJWT(profile)
	if err != nil {
		fmt.Println("Error generating JWT:", err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false,
	})

	storeKeyString := os.Getenv("COOKIE_STORE_KEY")
	var store = sessions.NewCookieStore([]byte(storeKeyString))

	session, _ := store.Get(r, "auth-session")
	session.Values["name"] = profile.Name
	session.Values["screen_name"] = profile.ScreenName
	session.Values["profile_image_url_https"] = profile.ProfileImageUrl
	session.Save(r, w)

	http.Redirect(w, r, fmt.Sprintf("%s:%s", os.Getenv("BASE_HTTP_URL"), os.Getenv("WEB_PORT")), http.StatusSeeOther)
}