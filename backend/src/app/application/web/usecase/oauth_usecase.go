package usecase

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"proto-pulse-plat/config"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/helper"
	"proto-pulse-plat/infrastructure/mapper"
	"proto-pulse-plat/infrastructure/response"
	"time"

	"github.com/dghubble/oauth1"
)

type OAuthUsecase interface {
	MakeOAuthRequest() (*http.Request, error)
	MakeOAuthClient(params url.Values) (*http.Client, error)
	GetOAuthResponse(r *http.Request) (string, error)
}

type oauthUsecase struct {
	xConfig *config.Xconfig
	userRepo repository.UsersRepository
}

func NewOAuthUseCase(xConfig *config.Xconfig, userRepo repository.UsersRepository) OAuthUsecase {
	return &oauthUsecase{
		xConfig:      xConfig,
		userRepo: userRepo,
	}
}

func (ou *oauthUsecase) MakeOAuthRequest() (*http.Request, error) {
	oauthTokenRequestURL, err := ou.makeOAuthTokenRequestURL()
	if err != nil {
		log.Fatal("Error oauthTokenRequestURL:", err)
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

	return http.NewRequest(http.MethodGet, fmt.Sprintf("%s?oauth_token=%s", ou.xConfig.AuthorizeURL, values.Get("oauth_token")), nil)
}

func (ou *oauthUsecase) makeOAuthTokenRequestURL() (string, error) {
	nonce, err := helper.GenerateNonce(16)
	if err != nil {
		fmt.Println("Error generating nonce:", err)
		return "", nil
	}

	params := url.Values{}
	params.Set("oauth_consumer_key", ou.xConfig.ConsumerKey)
	params.Set("oauth_signature_method", "HMAC-SHA1")
	params.Set("oauth_timestamp", fmt.Sprintf("%d", time.Now().Unix()))
	params.Set("oauth_nonce", nonce)
	params.Set("oauth_version", "1.0")
	params.Set("oauth_callback", ou.xConfig.CallBackURL)
	signatureBaseString := helper.CreateSignatureBaseString(http.MethodPost, ou.xConfig.RequestTokenURL, params)
	oauthSignature, err := helper.GenerateHMACSHA1Signature(signatureBaseString, ou.xConfig.ConsumerSecret+"&")
	if err != nil {
		fmt.Println("Error generating signature:", err)
		return "", nil
	}
	params.Set("oauth_signature", oauthSignature)

	return ou.xConfig.RequestTokenURL + "?" + params.Encode(), nil
}

func (ou *oauthUsecase) MakeOAuthClient(params url.Values) (*http.Client, error) {
	resp, err := http.PostForm(ou.xConfig.AccessTokenURL, params)
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

	config := oauth1.NewConfig(ou.xConfig.ConsumerKey, ou.xConfig.ConsumerSecret)
	token := oauth1.NewToken(oauthTokenValues.Get("oauth_token"), oauthTokenValues.Get("oauth_token_secret"))
	oauthClient := config.Client(oauth1.NoContext, token)

	return oauthClient, nil
}

func (ou *oauthUsecase) GetOAuthResponse(r *http.Request) (string, error) {
	params := url.Values{}
	params.Add("oauth_token", r.URL.Query().Get("oauth_token"))
	params.Add("oauth_verifier", r.URL.Query().Get("oauth_verifier"))

	oauthClient, err := ou.MakeOAuthClient(params)
	if err != nil {
		return "", errors.New(err.Error())
	}
	
	resp, err := oauthClient.Get(ou.xConfig.VerifyCredentials)
	if err != nil {
		return "", errors.New(err.Error())
	}
	defer resp.Body.Close()


	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New(err.Error())
	}

	var profile response.UserProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return "", errors.New(err.Error())
	}

	user, err := ou.userRepo.Save(mapper.ToModelUser(profile.ScreenName, profile.Name, ""))
	if err != nil {
		return "", errors.New("failed to save user")
	}

	tokenString, err := helper.GenerateJWT(profile, *user)
	if err != nil {
		return "", errors.New(err.Error())
	}

	return tokenString, nil
}
