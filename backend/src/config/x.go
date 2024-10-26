package config

var (
    RequestTokenURL     = getEnv("X_REQUEST_TOKEN_URL", "x_request_token_example")
    AccessTokenURL     = getEnv("X_ACCESS_TOKEN_URL", "x_access_token_url_example")
    ConsumerKey = getEnv("X_CONSUMER", "x_consumer_example")
    ConsumerSecret   = getEnv("X_CONSUMER_SECRET", "x_consumer_secret_example")
	AuthorizeURL = getEnv("X_AUTHORIZE_URL", "x_authorize_url_example")
	VerifyCredentials = getEnv("X_VERIFY_CREDENTIALS", "x_vverify_credentials_example")
)