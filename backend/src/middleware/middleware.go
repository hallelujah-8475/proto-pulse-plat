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
