package config

type Xconfig struct {
    RequestTokenURL     string
    AccessTokenURL      string
    ConsumerKey         string
    ConsumerSecret      string
    AuthorizeURL        string
    VerifyCredentials   string
    CallBackURL string
}

func LoadXconfig() *Xconfig {
    return &Xconfig{
        RequestTokenURL:     GetEnv("X_REQUEST_TOKEN_URL", "x_request_token_example"),
        AccessTokenURL:      GetEnv("X_ACCESS_TOKEN_URL", "x_access_token_url_example"),
        ConsumerKey:         GetEnv("X_CONSUMER", "x_consumer_example"),
        ConsumerSecret:      GetEnv("X_CONSUMER_SECRET", "x_consumer_secret_example"),
        AuthorizeURL:        GetEnv("X_AUTHORIZE_URL", "x_authorize_url_example"),
        VerifyCredentials:   GetEnv("X_VERIFY_CREDENTIALS", "x_verify_credentials_example"),
        CallBackURL: GetEnv("X_CALL_BACK_URL", "x_call_back_url_example"),
    }
}

