package middleware

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
)

func CORSMiddleware() func(http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins(
			[]string{
				fmt.Sprintf("%s:%s", os.Getenv("BASE_HTTP_URL"), os.Getenv("WEB_PORT")),
				fmt.Sprintf("%s", os.Getenv("BASE_HTTPS_URL")),
			},
		),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"X-Csrf-Token", "Content-Type", "Authorization"}),
		handlers.AllowCredentials(),
	)
}

func SessionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil || cookie.Value == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if !isValidToken(cookie.Value) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func isValidToken(token string) bool {
	return token != ""
}