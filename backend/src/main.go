package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"proto-pulse-plat/app/presentation/http/web/handler"
	"proto-pulse-plat/app/presentation/http/web/handler/application/web/usecase"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	oauthUsecase := usecase.NewOAuthUseCase()
	oauthClientHandler := handler.NewOAuthClient(*oauthUsecase)

	r := mux.NewRouter()

	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/oauth", oauthClientHandler.OauthHandler)
	apiRouter.HandleFunc("/oauth2callback", oauthClientHandler.Oauth2callbackHandler)

	srv := &http.Server{
		Addr:    ":" + os.Getenv("API_PORT"),
		Handler: r,
	}
	err = srv.ListenAndServeTLS("server.crt", "server.key")
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
