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

	postsRepository := postgres.NewGormPostsRepository(db)
	usersRepository := postgres.NewGormUsersRepository(db)
	postImagesRepository := postgres.NewGormPostImagesRepository(db)

	oauthUsecase := usecase.NewOAuthUseCase(xConfig)
	postUsecase := usecase.NewPostUsecase(postsRepository)
	userUsecase := usecase.NewUserUsecase(usersRepository)
	postImageUsercase := usecase.NewPostImageUsecase(postImagesRepository)

	certificationHandler := handler.NewCertificationHandler()
	oauthClientHandler := handler.NewOAuthClient(*oauthUsecase, xConfig)
	postHandler := handler.NewPostHandler(postUsecase, userUsecase, postImageUsercase)

	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/certification", certificationHandler.Certificate)
	apiRouter.HandleFunc("/oauth", oauthClientHandler.OauthCertificate)
	apiRouter.HandleFunc("/oauth2callback", oauthClientHandler.OauthCallback)
	apiRouter.HandleFunc("/user/profile", oauthClientHandler.UserProfile)
	postRouter := apiRouter.PathPrefix("/post").Subrouter()
	postRouter.HandleFunc("/add", postHandler.AddPost)
	postRouter.HandleFunc("/delete", postHandler.DeletePost)
	postRouter.HandleFunc("/list", postHandler.GetPostList)
	postRouter.HandleFunc("/get", postHandler.GetPost)
	postRouter.HandleFunc("/edit", postHandler.UpdatePost)

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
