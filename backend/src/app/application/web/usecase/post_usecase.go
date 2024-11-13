package usecase

import (
	"errors"
	"fmt"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/domain/repository"
	"proto-pulse-plat/infrastructure/model"
	"strconv"
	"time"
)

type PostUsecase interface {
	List(pageStr, perPageStr string) ([]map[string]interface{}, int64, int, int, error)
	Delete(postID int) error
	Add(title, content, fileName string, userID uint) error
	GetByID(postID int) (*entity.Post, error)
	Update(postID int, content, fileName string) error
	// GetUserIcon(iconURL string) ([]byte, error)
}

type postUsecase struct {
	postRepo repository.PostRepository
}

func NewPostUsecase(postRepo repository.PostRepository) PostUsecase {
	return &postUsecase{
		postRepo: postRepo,
	}
}

func (u *postUsecase) List(pageStr, perPageStr string) ([]map[string]interface{}, int64, int, int, error) {
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

	posts, totalCount, err := u.postRepo.FindAllWithPagination(perPage, offset)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	var response []entity.Post
	for _, post := range posts {
		response = append(response, entity.Post{
			ID:        post.ID,
			Title:     post.Title,
			Content:   post.Content,
			FileName:  post.FileName,
			FilePath:  post.FilePath,
			UserID:    post.UserID,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			User: entity.User{
				ID:        post.User.ID,
				UserName:  post.User.UserName,
				AccountID: post.User.AccountID,
				IconURL:   post.User.IconURL,
			},
		})
	}

	var responsePosts []map[string]interface{}
	for _, post := range response {
		responsePost := map[string]interface{}{
			"id":        post.ID,
			"title":     post.Title,
			"content":   post.Content,
			"file_name": post.FileName,
			"file_path": post.FilePath,
			"user_id":   post.UserID,
			"user": map[string]interface{}{
				"id":         post.User.ID,
				"user_name":  post.User.UserName,
				"account_id": post.User.AccountID,
				"icon_url":   post.User.IconURL,
			},
			"created_at": post.CreatedAt,
			"updated_at": post.UpdatedAt,
		}
		responsePosts = append(responsePosts, responsePost)
	}

	return responsePosts, totalCount, page, perPage, nil
}

func (u *postUsecase) Delete(postID int) error {
	if postID <= 0 {
		return fmt.Errorf("invalid post ID: %d", postID)
	}

	if err := u.postRepo.Delete(postID); err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	return nil
}

func (u *postUsecase) Add(title, content, fileName string, userID uint) error {
	if content == "" {
		return errors.New("content cannot be empty")
	}

	post := model.Post{
		Title:    title,
		Content:  content,
		FileName: fileName,
		UserID:   int(userID),
	}

	if err := u.postRepo.Save(post); err != nil {
		return fmt.Errorf("failed to save post: %w", err)
	}

	return nil
}

func (u *postUsecase) GetByID(postID int) (*entity.Post, error) {
	if postID <= 0 {
		return nil, fmt.Errorf("invalid post ID: %d", postID)
	}

	post, err := u.postRepo.FindByID(postID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get post by ID: %w", err)
	}

	// 投稿データをエンティティに変換
	response := &entity.Post{
		ID:        post.ID,
		Content:   post.Content,
		FileName:  post.FileName,
		UserID:    post.UserID,
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt,
		User: entity.User{
			ID:        post.User.ID,
			UserName:  post.User.UserName,
			AccountID: post.User.AccountID,
			IconURL:   post.User.IconURL,
		},
	}

	return response, nil
}

func (uc *postUsecase) Update(postID int, content, fileName string) error {
	postEntity, err := uc.postRepo.FindByID(postID)
	if err != nil {
		return fmt.Errorf("could not find post with id %d: %w", postID, err)
	}

	post := model.Post{
		ID:        postID,
		Content:   content,
		FileName:  fileName,
		UserID:    int(postEntity.UserID),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := uc.postRepo.Update(post); err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	return nil
}

// func (uc *postUsecase) GetUserIcon(iconURL string) ([]byte, error) {
// 	// LocalStackのS3クライアントを作成
// 	sess := session.Must(session.NewSession(&aws.Config{
// 		Endpoint:         aws.String(os.Getenv("S3_ENDPOINT")),
// 		Region:           aws.String(os.Getenv("S3_REGION")),
// 		Credentials:      credentials.NewStaticCredentials("dummy", "dummy", ""),
// 		S3ForcePathStyle: aws.Bool(true),
// 	}))
// 	svc := s3.New(sess)

//     // S3からオブジェクトを取得するリクエスト
//     output, err := svc.GetObject(&s3.GetObjectInput{
//         Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
//         Key:    aws.String(iconURL),
//     })
//     if err != nil {
//         return nil, fmt.Errorf("failed to get object from S3: %w", err)
//     }
//     defer output.Body.Close()

//     // バイトデータとして読み込み
//     buf := new(bytes.Buffer)
//     _, err = io.Copy(buf, output.Body)
//     if err != nil {
//         return nil, fmt.Errorf("failed to read object body: %w", err)
//     }

// 	// レスポンスヘッダーを設定して画像データを返す
// 	w.Header().Set("Content-Type", "image/jpeg") // JPEGの場合
// 	w.WriteHeader(http.StatusOK)
// 	w.Write(buf.Bytes())
// }
