package helper

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"encoding/hex"
	"net/url"
	"sort"
	"strings"
)

// oauth_nonce を生成する関数
func GenerateNonce(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Signature Base String の作成 (url.Values 用)
func CreateSignatureBaseString(httpMethod, baseURL string, params url.Values) string {
	return httpMethod + "&" + url.QueryEscape(baseURL) + "&" + url.QueryEscape(EncodeParameters(params))
}

// HMAC-SHA1で署名を生成する関数
func GenerateHMACSHA1Signature(baseString, signingKey string) (string, error) {
	key := []byte(signingKey)
	h := hmac.New(sha1.New, key)
	_, err := h.Write([]byte(baseString))
	if err != nil {
		return "", err
	}
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return signature, nil
}

// パラメータをエンコードする関数 (url.Values 用)
func EncodeParameters(params url.Values) string {
	var keys []string
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	var queryString []string
	for _, key := range keys {
		for _, value := range params[key] {
			queryString = append(queryString, url.QueryEscape(key)+"="+url.QueryEscape(value))
		}
	}
	return strings.Join(queryString, "&")
}
