package usecase

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"proto-pulse-plat/helper"
	"time"

	"github.com/dghubble/oauth1"
)

type OAuthUsecase struct {
	RequestTokenURL string
	AccessTokenURL  string
	ConsumerKey     string
	ConsumerSecret  string
}

func NewOAuthUseCase() *OAuthUsecase {
	return &OAuthUsecase{
		RequestTokenURL: os.Getenv("TWITTER_REQUEST_TOKEN_URL"),
		AccessTokenURL:  os.Getenv("TWITTER_ACCESS_TOKEN_URL"),
		ConsumerKey:     os.Getenv("TWITTER_CONSUMER"),
		ConsumerSecret:  os.Getenv("TWITTER_CONSUMER_SECRET"),
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

func (ou *OAuthUsecase) makeOAuthTokenRequestURL() (string, error) {
	nonce, err := helper.GenerateNonce(16)
	if err != nil {
		log.Fatal("Error generating nonce:", err)
	}

	params := url.Values{}
	params.Set("oauth_consumer_key", os.Getenv("TWITTER_CONSUMER"))
	params.Set("oauth_signature_method", "HMAC-SHA1")
	params.Set("oauth_timestamp", fmt.Sprintf("%d", time.Now().Unix()))
	params.Set("oauth_nonce", nonce)
	params.Set("oauth_version", "1.0")
	params.Set("oauth_callback", os.Getenv("TWITTER_CALL_BACK_URL"))
	signatureBaseString := helper.CreateSignatureBaseString(http.MethodPost, ou.RequestTokenURL, params)
	oauthSignature, err := helper.GenerateHMACSHA1Signature(signatureBaseString, os.Getenv("TWITTER_CONSUMER_SECRET")+"&")
	if err != nil {
		log.Fatal("Error generating signature:", err)
	}
	params.Set("oauth_signature", oauthSignature)

	return ou.RequestTokenURL + "?" + params.Encode(), nil
}

func (ou *OAuthUsecase) MakeOAuthClient(params url.Values) *http.Client {
	resp, err := http.PostForm(ou.AccessTokenURL, params)
	if err != nil {
		fmt.Println("Error getting access token:", err)
		return nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return nil
	}

	oauthTokenValues, err := url.ParseQuery(string(body))
	if err != nil {
		fmt.Println("Error parsing access token response:", err)
		return nil
	}

	config := oauth1.NewConfig(ou.ConsumerKey, ou.ConsumerSecret)
	token := oauth1.NewToken(oauthTokenValues.Get("oauth_token"), oauthTokenValues.Get("oauth_token_secret"))
	oauthClient := config.Client(oauth1.NoContext, token)

	return oauthClient
}
