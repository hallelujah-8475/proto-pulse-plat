package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	postgres_driver "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"proto-pulse-plat/app/application/web/usecase"
	"proto-pulse-plat/app/presentation/http/web/handler"
	"proto-pulse-plat/config"
	"proto-pulse-plat/infrastructure/persistence/postgres"
	"proto-pulse-plat/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	db, err := gorm.Open(postgres_driver.Open(config.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	xConfig := config.LoadXconfig()

	certificationHandler := handler.NewCertificationHandler()
	oauthUsecase := usecase.NewOAuthUseCase(xConfig)
	oauthClientHandler := handler.NewOAuthClient(*oauthUsecase, xConfig)
	postRepository := postgres.NewGormPostsRepository(db)
	postUsecase := usecase.NewPostUsecase(postRepository)
	postHandler := handler.NewPostHandler(postUsecase)

	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/certification", certificationHandler.Certificate)
	apiRouter.HandleFunc("/oauth", oauthClientHandler.OauthCertificate)
	apiRouter.HandleFunc("/oauth2callback", oauthClientHandler.OauthCallback)
	apiRouter.HandleFunc("/user/profile", oauthClientHandler.UserProfile)
	postRouter := apiRouter.PathPrefix("/post").Subrouter()
	postRouter.HandleFunc("/add", postHandler.Add)
	postRouter.HandleFunc("/delete", postHandler.Delete)
	postRouter.HandleFunc("/list", postHandler.List)
	postRouter.HandleFunc("/get", postHandler.GetPost)
	postRouter.HandleFunc("/edit", postHandler.Update)

	corsMiddleware := middleware.CORSMiddleware()
	srv := &http.Server{
		Addr:    ":" + os.Getenv("API_PORT"),
		Handler: corsMiddleware(r),
	}
	err = srv.ListenAndServeTLS("server.crt", "server.key")
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
