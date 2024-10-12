package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"proto-pulse-plat/app/presentation/http/web/handler/application/web/usecase"
)

type UserProfile struct {
	Name            string `json:"name"`
	ScreenName      string `json:"screen_name"`
	ProfileImageUrl string `json:"profile_image_url_https"`
}

type OAuthClient struct {
	OauthUsecase      usecase.OAuthUsecase
	AuthorizeURL      string
	VerifyCredentials string
}

func NewOAuthClient(oauthUsecase usecase.OAuthUsecase) *OAuthClient {
	return &OAuthClient{
		OauthUsecase:      oauthUsecase,
		AuthorizeURL:      os.Getenv("TWITTER_AUTHORIZE_URL"),
		VerifyCredentials: os.Getenv("TWITTER_VERIFY_CREDENTIALS"),
	}
}

func (oc *OAuthClient) OauthHandler(w http.ResponseWriter, r *http.Request) {
	oauthToken, err := oc.OauthUsecase.GetOAuthToken()
	if err != nil {
		fmt.Println(err)
		return
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s?oauth_token=%s", oc.AuthorizeURL, oauthToken), nil)
	if err != nil {
		log.Fatal("Error creating request:", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Error sending request:", err)
	}
	defer resp.Body.Close()

	http.Redirect(w, r, resp.Request.URL.String(), http.StatusFound)
}

func (oc *OAuthClient) Oauth2callbackHandler(w http.ResponseWriter, r *http.Request) {
	params := url.Values{}
	params.Add("oauth_token", r.URL.Query().Get("oauth_token"))
	params.Add("oauth_verifier", r.URL.Query().Get("oauth_verifier"))

	oauthClient := oc.OauthUsecase.MakeOAuthClient(params)

	resp, err := oauthClient.Get(oc.VerifyCredentials)
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

	var profile UserProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		fmt.Println("Error parsing JSON:", err)
		return
	}

	fmt.Printf("Name: %s\n", profile.Name)
	fmt.Printf("Screen Name: %s\n", profile.ScreenName)
	fmt.Printf("Profile Image URL: %s\n", profile.ProfileImageUrl)

	fmt.Fprintln(w, "Authentication successful! You can close this window.")
}
