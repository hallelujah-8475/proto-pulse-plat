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
)

type OAuthClient struct {
	OauthUsecase usecase.OAuthUsecase
	UserUsecase usecase.UserUsecase
}

func NewOAuthClient(oauthUsecase usecase.OAuthUsecase, userUsecase usecase.UserUsecase, xConfig *config.Xconfig) *OAuthClient {
	return &OAuthClient{
		OauthUsecase: oauthUsecase,
		UserUsecase: userUsecase,
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
		http.Error(w, "OAuth client creation failed", http.StatusInternalServerError)
		return
	}

	resp, err := oc.OauthUsecase.GetOAuthResponse(oauthClient)
	if err != nil {
		fmt.Println("Error verifying credentials:", err)
		http.Error(w, "OAuth response retrieval failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		http.Error(w, "Failed to read response body", http.StatusInternalServerError)
		return
	}

	var profile model.UserProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		fmt.Println("Error parsing JSON:", err)
		http.Error(w, "Failed to parse JSON response", http.StatusInternalServerError)
		return
	}

	tokenString, err := helper.GenerateJWT(profile)
	if err != nil {
		fmt.Println("Error generating JWT:", err)
		http.Error(w, "Failed to generate JWT", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false, // 本番環境では true にする
	})

	err = oc.UserUsecase.Add(profile.ScreenName, profile.Name, "")
	if err != nil {
		log.Println("user Add error")
		return
	}

	// リダイレクトURLの作成とリダイレクト
	redirectURL := fmt.Sprintf("%s:%s", os.Getenv("BASE_HTTPS_URL"), os.Getenv("WEB_PORT"))
	http.Redirect(w, r, redirectURL, http.StatusSeeOther)
}
