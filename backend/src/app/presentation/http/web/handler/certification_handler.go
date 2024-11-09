package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"proto-pulse-plat/infrastructure/model"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)



type CertificationHandler struct {
}

func NewCertificationHandler() *CertificationHandler {
	return &CertificationHandler{
	}
}

func (ch *CertificationHandler) Certificate(w http.ResponseWriter, r *http.Request) {
    cookie, err := r.Cookie("jwt")
    if err != nil {
        if err == http.ErrNoCookie {
            http.Error(w, "No session cookie found", http.StatusUnauthorized)
            return
        }
        http.Error(w, "Error retrieving cookie", http.StatusBadRequest)
        return
    }

	tokenStr := cookie.Value
    claims := &jwt.MapClaims{}

	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		fmt.Println("Invalid token format:", tokenStr)
		http.Error(w, "Invalid token format", http.StatusUnauthorized)
		return
	}

	secretKeyStr := os.Getenv("JWT_SECRET_KEY")
    secretKey := []byte(secretKeyStr)

    token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
        }
        return secretKey, nil
    })
    if err != nil || token == nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    name, ok := (*claims)["name"].(string)
    if !ok {
        http.Error(w, "Invalid name claim", http.StatusUnauthorized)
        return
    }
    screenName, ok := (*claims)["screen_name"].(string)
    if !ok {
        http.Error(w, "Invalid screen_name claim", http.StatusUnauthorized)
        return
    }
    profileImageUrl, ok := (*claims)["profile_image_url"].(string)
    if !ok {
        http.Error(w, "Invalid profile_image_url claim", http.StatusUnauthorized)
        return
    }

	profile := model.UserProfile{
		Name:            name,
		ScreenName:      screenName,
		ProfileImageUrl: profileImageUrl,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
