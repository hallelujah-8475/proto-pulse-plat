package usecase

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"proto-pulse-plat/config"
	"proto-pulse-plat/helper"
	"time"

	"github.com/dghubble/oauth1"
)

type OAuthUsecase struct {
	AuthorizeURL      string
	VerifyCredentials string
	RequestTokenURL   string
	AccessTokenURL    string
	ConsumerKey       string
	ConsumerSecret    string
	CallBackURL       string
}

func NewOAuthUseCase(xConfig *config.Xconfig) *OAuthUsecase {
	return &OAuthUsecase{
		AuthorizeURL:      xConfig.AuthorizeURL,
		VerifyCredentials: xConfig.VerifyCredentials,
		RequestTokenURL:   xConfig.RequestTokenURL,
		AccessTokenURL:    xConfig.AccessTokenURL,
		ConsumerKey:       xConfig.ConsumerKey,
		ConsumerSecret:    xConfig.ConsumerSecret,
		CallBackURL:       xConfig.CallBackURL,
	}
}

func (ou *OAuthUsecase) GetOAuthToken() (string, error) {
	oauthTokenRequestURL, err := ou.makeOAuthTokenRequestURL()
	if err != nil {
		fmt.Println(err)
		return "", nil
	}

	req, err := http.NewRequest(http.MethodPost, oauthTokenRequestURL, nil)
	if err != nil {
		log.Fatal("Error creating request:", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Error sending request:", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Error reading response:", err)
	}

	values, err := url.ParseQuery(string(body))
	if err != nil {
		log.Fatal("Error parsing response:", err)
	}

	return values.Get("oauth_token"), nil
}

func (ou *OAuthUsecase) MakeOAuthRequest(oauthToken string) (*http.Request, error) {
	return http.NewRequest(http.MethodGet, fmt.Sprintf("%s?oauth_token=%s", ou.AuthorizeURL, oauthToken), nil)
}

func (ou *OAuthUsecase) makeOAuthTokenRequestURL() (string, error) {
	nonce, err := helper.GenerateNonce(16)
	if err != nil {
		fmt.Println("Error generating nonce:", err)
		return "", nil
	}

	params := url.Values{}
	params.Set("oauth_consumer_key", ou.ConsumerKey)
	params.Set("oauth_signature_method", "HMAC-SHA1")
	params.Set("oauth_timestamp", fmt.Sprintf("%d", time.Now().Unix()))
	params.Set("oauth_nonce", nonce)
	params.Set("oauth_version", "1.0")
	params.Set("oauth_callback", ou.CallBackURL)
	signatureBaseString := helper.CreateSignatureBaseString(http.MethodPost, ou.RequestTokenURL, params)
	oauthSignature, err := helper.GenerateHMACSHA1Signature(signatureBaseString, ou.ConsumerSecret+"&")
	if err != nil {
		fmt.Println("Error generating signature:", err)
		return "", nil
	}
	params.Set("oauth_signature", oauthSignature)

	return ou.RequestTokenURL + "?" + params.Encode(), nil
}

func (ou *OAuthUsecase) MakeOAuthClient(params url.Values) (*http.Client, error) {
	resp, err := http.PostForm(ou.AccessTokenURL, params)
	if err != nil {
		fmt.Println("Error getting access token:", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return nil, err
	}

	oauthTokenValues, err := url.ParseQuery(string(body))
	if err != nil {
		fmt.Println("Error parsing access token response:", err)
		return nil, err
	}

	config := oauth1.NewConfig(ou.ConsumerKey, ou.ConsumerSecret)
	token := oauth1.NewToken(oauthTokenValues.Get("oauth_token"), oauthTokenValues.Get("oauth_token_secret"))
	oauthClient := config.Client(oauth1.NoContext, token)

	return oauthClient, nil
}

func (ou *OAuthUsecase) GetOAuthResponse(oauthClient *http.Client) (*http.Response, error) {
	return oauthClient.Get(ou.VerifyCredentials)
}
