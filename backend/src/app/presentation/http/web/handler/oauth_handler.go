package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/config"
	"proto-pulse-plat/helper"
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
	req, err := oc.OauthUsecase.MakeOAuthRequest()
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
	tokenString, err := oc.OauthUsecase.GetOAuthResponse(r)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed GetOAuthResponse", http.StatusInternalServerError)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false, // 本番環境では true にする
	})

	http.Redirect(w, r, fmt.Sprintf("%s:%s", os.Getenv("BASE_HTTPS_URL"), os.Getenv("WEB_PORT")), http.StatusSeeOther)
}
