package main

import (
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
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "local"
	}

	var err error
	if env == "local" {
		err = godotenv.Load(".env")
	} else if env == "production" {
		err = godotenv.Load("/etc/secrets/.env")
	}

	db, err := gorm.Open(postgres_driver.Open(config.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	xConfig := config.LoadXconfig()

	postsRepository := postgres.NewGormPostsRepository(db)
	usersRepository := postgres.NewGormUsersRepository(db)
	postImagesRepository := postgres.NewGormPostImagesRepository(db)

	oauthUsecase := usecase.NewOAuthUseCase(xConfig, usersRepository)
	postUsecase := usecase.NewPostUsecase(postsRepository, postImagesRepository, usersRepository)

	healthCheckHandler := handler.NewHealthCheckHandler()
	oauthClientHandler := handler.NewOAuthClient(oauthUsecase, xConfig)
	postHandler := handler.NewPostHandler(postUsecase)
	logoutHandler := handler.NewLogoutHandler()

	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/health", healthCheckHandler.HealthCheck)
	apiRouter.HandleFunc("/oauth", oauthClientHandler.OauthCertificate)
	apiRouter.HandleFunc("/oauth2callback", oauthClientHandler.OauthCallback)
	apiRouter.HandleFunc("/logout", logoutHandler.Logout)
	postRouter := apiRouter.PathPrefix("/post").Subrouter()
	postRouter.HandleFunc("/add", postHandler.AddPost)
	postRouter.HandleFunc("/delete", postHandler.DeletePost)
	postRouter.HandleFunc("/list", postHandler.GetPostList)
	postRouter.HandleFunc("/get", postHandler.GetPost)
	// postRouter.HandleFunc("/edit", postHandler.UpdatePost)

	corsMiddleware := middleware.CORSMiddleware()
	srv := &http.Server{
		Addr:    ":" + os.Getenv("PORT"),
		Handler: corsMiddleware(r),
	}
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
