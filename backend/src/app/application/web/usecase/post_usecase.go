package usecase

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"proto-pulse-plat/app/presentation/http/web/validation"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/helper"
	"proto-pulse-plat/infrastructure/mapper"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/response"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type PostUsecase interface {
	List(r *http.Request) (response.PostList, error)
	Delete(r *http.Request) error
	Add(r *http.Request) error
	Update(r *http.Request) error
	FileUploads(files []*multipart.FileHeader) error
	GetPost(r *http.Request) (response.PostDetail, error)
}

type postUsecase struct {
	postRepo      repository.PostRepository
	postImageRepo repository.PostImagesRepository
	userRepo      repository.UsersRepository
}

func NewPostUsecase(
	postRepo repository.PostRepository,
	postImageRepo repository.PostImagesRepository,
	userRepo repository.UsersRepository,
) PostUsecase {
	return &postUsecase{
		postRepo:      postRepo,
		postImageRepo: postImageRepo,
		userRepo:      userRepo,
	}
}

type DeletePostRequest struct {
	PostID int `json:"post_id"`
}

func (u *postUsecase) List(r *http.Request) (response.PostList, error) {
    var profile *model.UserProfile

    // JWT Cookie を取得
    cookie, err := r.Cookie("jwt")
    if err != nil {
        if err == http.ErrNoCookie {
            // JWT がない場合でも動作するように profile を nil に設定
            profile = nil
        } else {
            return response.PostList{}, fmt.Errorf("failed to get cookie: %v", err)
        }
    } else {
        // JWT を解析
        tokenStr := cookie.Value
        claims := &jwt.MapClaims{}
        secretKeyStr := os.Getenv("JWT_SECRET_KEY")
        secretKey := []byte(secretKeyStr)

        token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return secretKey, nil
        })
        if err == nil && token != nil && token.Valid {
            // 必要なクレームを取得
            id, _ := (*claims)["id"].(float64)
            name, _ := (*claims)["name"].(string)
            screenName, _ := (*claims)["screen_name"].(string)
            profileImageUrl, _ := (*claims)["profile_image_url"].(string)

            profile = &model.UserProfile{
                ID:              id,
                Name:            name,
                ScreenName:      screenName,
                ProfileImageUrl: profileImageUrl,
            }
        }
    }

    // ページング情報を取得
    pageStr, perPageStr := helper.PostListQueryParams(r)
    page := 1
    perPage := 8

    if pageStr != "" {
        p, err := strconv.Atoi(pageStr)
        if err == nil && p > 0 {
            page = p
        }
    }
    if perPageStr != "" {
        pp, err := strconv.Atoi(perPageStr)
        if err == nil && pp > 0 {
            perPage = pp
        }
    }

    offset := (page - 1) * perPage

    // 投稿データを取得
    posts, totalCount, err := u.postRepo.FindAllWithPagination(perPage, offset)
    if err != nil {
        return response.PostList{}, err
    }

    var users []entity.User
    for _, post := range posts {
        user, err := u.userRepo.Find(post.UserID)
        if err != nil {
            fmt.Println("Error fetching user:", err)
            continue
        }
        users = append(users, *user)
    }

    postImagesMap := make(map[uint][]entity.PostImage)
    for _, post := range posts {
        postImages, err := u.postImageRepo.FindByPostID(post.ID)
        if err != nil {
            fmt.Println("Error fetching post images:", err)
            continue
        }
        postImagesMap[post.ID] = postImages
    }

    // レスポンスを作成
    return helper.BuildPostListResponse(posts, users, postImagesMap, totalCount, page, perPage, profile), nil
}

func (u *postUsecase) Delete(r *http.Request) error {
	err := helper.ValidateMethod(r, http.MethodPost)
	if err != nil {
		return errors.New(err.Error())
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return errors.New(err.Error())
	}
	defer r.Body.Close()

	var req DeletePostRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return errors.New(err.Error())
	}

	if req.PostID <= 0 {
		return errors.New(err.Error())
	}

	if err := u.postRepo.Delete(req.PostID); err != nil {
		return errors.New(err.Error())
	}

	return nil
}

func (u *postUsecase) Add(r *http.Request) error {
	err := helper.ValidateMethod(r, http.MethodPost)
	if err != nil {
		return errors.New(err.Error())
	}

	var profile *model.UserProfile

    // JWT Cookie を取得
    cookie, err := r.Cookie("jwt")
    if err != nil {
        if err == http.ErrNoCookie {
            // JWT がない場合でも動作するように profile を nil に設定
            profile = nil
        } else {
            return errors.New(err.Error())
        }
    } else {
        // JWT を解析
        tokenStr := cookie.Value
        claims := &jwt.MapClaims{}
        secretKeyStr := os.Getenv("JWT_SECRET_KEY")
        secretKey := []byte(secretKeyStr)

        token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return secretKey, nil
        })
        if err == nil && token != nil && token.Valid {
            // 必要なクレームを取得
            id, _ := (*claims)["id"].(float64)
            name, _ := (*claims)["name"].(string)
            screenName, _ := (*claims)["screen_name"].(string)
            profileImageUrl, _ := (*claims)["profile_image_url"].(string)

            profile = &model.UserProfile{
                ID:              id,
                Name:            name,
                ScreenName:      screenName,
                ProfileImageUrl: profileImageUrl,
            }
        }
    }

	err = helper.ParseMultipart(r)
	if err != nil {
		return errors.New(err.Error())
	}

	title, content, files, err := validation.ValidateFormInputs(r)
	if err != nil {
		return errors.New(err.Error())
	}

	if content == "" {
		return errors.New(err.Error())
	}

	addedPost, err := u.postRepo.Save(mapper.ToModelPost(title, content, uint(profile.ID)))
	if err != nil {
		return errors.New(err.Error())
	}

	if files == nil {
		log.Println("file is nil")
		return nil
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return errors.New(err.Error())
		}
		defer file.Close()

		if err := helper.UploadFileToS3(file, fileHeader.Filename); err != nil {
			return errors.New(err.Error())
		}
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return errors.New(err.Error())
		}
		defer file.Close()

		if err := u.postImageRepo.Save(mapper.ToModelPostImage(fileHeader.Filename, addedPost.ID)); err != nil {
			return errors.New(err.Error())
		}
	}

	return nil
}

func (uc *postUsecase) Update(r *http.Request) error {
	err := helper.ValidateMethod(r, http.MethodPut)
	if err != nil {
		return errors.New(err.Error())
	}

	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		return errors.New(err.Error())
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		return errors.New(err.Error())
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		return errors.New(err.Error())
	}

	title := r.FormValue("title")
	if title == "" {
		return errors.New(err.Error())
	}

	content := r.FormValue("content")
	if content == "" {
		return errors.New(err.Error())
	}

	var file multipart.File
	var fileHeader *multipart.FileHeader
	file, fileHeader, err = r.FormFile("file")
	if err != nil && err != http.ErrMissingFile {
		return errors.New(err.Error())
	}

	if fileHeader != nil {
		defer file.Close()

		if fileHeader == nil {
			return errors.New(err.Error())
		}
		fmt.Println("File uploaded:", fileHeader.Filename)
	}

	postEntity, err := uc.postRepo.FindByID(postID)
	if err != nil {
		return fmt.Errorf("could not find post with id %d: %w", postID, err)
	}

	post := model.Post{
		ID:        postID,
		Title:     title,
		Content:   content,
		UserID:    int(postEntity.UserID),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := uc.postRepo.Update(post); err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	return nil
}

func (uc *postUsecase) FileUploads(files []*multipart.FileHeader) error {
	if files == nil {
		log.Println("files is nil")
		return nil
	}

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return fmt.Errorf("failed to open file: %w", err)
		}
		defer file.Close()

		if err := helper.UploadFileToS3(file, fileHeader.Filename); err != nil {
			return fmt.Errorf("failed to upload file: %w", err)
		}
	}
	return nil
}

func (uc *postUsecase) GetPost(r *http.Request) (response.PostDetail, error) {
	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		return response.PostDetail{}, errors.New("postIDStr is blank")
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		return response.PostDetail{}, errors.New("postIDStr is invalid")
	}

	post, err := uc.postRepo.FindByID(postID)
	if err != nil {
		return response.PostDetail{}, errors.New("GetByID occured error")
	}

	postImages, err := uc.postImageRepo.FindByPostID(post.ID)
	if err != nil {
		return response.PostDetail{}, errors.New("FindByPostID occured error")
	}

	postDetail := helper.BuildPostResponse(post, postImages)

	return postDetail, nil
}
