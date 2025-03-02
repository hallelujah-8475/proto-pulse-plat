package helper

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/response"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func PostListQueryParams(r *http.Request) (string, string) {
	pageStr := r.URL.Query().Get("page")
	perPageStr := r.URL.Query().Get("perPage")

	return pageStr, perPageStr
}

func BuildPostListResponse(
	posts []entity.Post,
	users []entity.User,
	postImagesMap map[uint][]entity.PostImage,
	totalCount int64,
	page, perPage int,
	loginUser *model.UserProfile,
) response.PostList {
	// ユーザーIDをキーにしたユーザーマップを作成
	userMap := make(map[uint]entity.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	// レスポンス用のPostリストを作成
	var responsePosts []response.Post
	for _, post := range posts {
		// 投稿に関連付けられたユーザー情報を取得
		user := userMap[post.UserID]

		// 投稿に関連付けられた画像を取得
		postImages := postImagesMap[post.ID]

		// ベース64エンコードされた画像を結合（例として最初の画像のみ）
		var postImageBase64 string
		if len(postImages) > 0 {
			postImageBase64 = fmt.Sprintf(
				"data:%s;base64,%s",
				getImageBase64(postImages[0].FileName),
				base64.StdEncoding.EncodeToString(postImages[0].Data),
			) // PostImageにBase64フィールドがあると仮定
		}

		// レスポンス用Post構造体に変換
		responsePost := response.Post{
			ID:              post.ID,
			Title:           post.Title,
			Content:         post.Content,
			PostImageBase64: postImageBase64,
			UserName:        user.UserName,
			AccountID:       user.AccountID,
			IconImageBase64: fmt.Sprintf(
				"data:%s;base64,%s",
				getImageBase64(user.IconFileName),
				base64.StdEncoding.EncodeToString(user.IconData)),
			IsOwnPost: loginUser != nil && user.UserName == loginUser.ScreenName,
		}
		responsePosts = append(responsePosts, responsePost)
	}

	// PostList構造体にデータを詰めて返却
	return response.PostList{
		Posts:      responsePosts,
		TotalCount: totalCount,
		Page:       page,
		PerPage:    perPage,
	}
}

func BuildPostResponse(post *entity.Post, postImages []entity.PostImage) response.PostDetail {
	var postImagesBase64 []string

	for _, postImage := range postImages {
		postImageBase64 := fmt.Sprintf(
			"data:%s;base64,%s",
			getImageBase64(postImage.FileName),
			base64.StdEncoding.EncodeToString(postImage.Data),
		);
		postImagesBase64 = append(postImagesBase64, postImageBase64)
	}

	responsePost := response.PostDetail{
		ID:               post.ID,
		Title:            post.Title,
		Content:          post.Content,
		PostImagesBase64: postImagesBase64,
	}

	return responsePost
}

func GetPostBase64Image(fileName string) string {
	// LocalStackのS3クライアントを作成
	sess := session.Must(session.NewSession(&aws.Config{
		Endpoint:         aws.String(os.Getenv("S3_ENDPOINT")),
		Region:           aws.String(os.Getenv("S3_REGION")),
		Credentials:      credentials.NewStaticCredentials("dummy", "dummy", ""),
		S3ForcePathStyle: aws.Bool(true),
	}))
	svc := s3.New(sess)

	// S3からオブジェクトを取得するリクエスト
	output, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(fileName),
	})
	if err != nil {
		return ""
	}
	defer output.Body.Close()

	// バイトデータとして読み込み
	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, output.Body)
	if err != nil {
		fmt.Println("failed to read object body: %w", err)
		return ""
	}

	decryptedImage, err := decrypt(buf.Bytes(), "thisis16byteskey")
	if err != nil {
		log.Println("decrypt is error")
		return ""
	}

	// 画像データをBase64エンコード
	encodedImage := base64.StdEncoding.EncodeToString(decryptedImage)

	// レスポンスボディにBase64エンコードされた画像データを含める
	response := fmt.Sprintf("data:%s;base64,%s", getImageBase64(fileName), encodedImage)

	return response
}

func getImageBase64(iconURL string) string {
	// ファイル名から拡張子を取得
	ext := strings.ToLower(filepath.Ext(iconURL))

	// 拡張子に基づくMIMEタイプの判定
	mimeType := ""
	switch ext {
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	case ".png":
		mimeType = "image/png"
	case ".gif":
		mimeType = "image/gif"
	case ".bmp":
		mimeType = "image/bmp"
	case ".webp":
		mimeType = "image/webp"
	default:
		return ""
	}

	return mimeType
}

func UploadFileToS3(file io.Reader, filename string) error {
	// LocalStackのS3クライアントを作成
	sess := session.Must(session.NewSession(&aws.Config{
		Endpoint:         aws.String(os.Getenv("S3_ENDPOINT")),
		Region:           aws.String(os.Getenv("S3_REGION")),
		Credentials:      credentials.NewStaticCredentials("dummy", "dummy", ""),
		S3ForcePathStyle: aws.Bool(true),
	}))
	svc := s3.New(sess)

	// バケットが存在するか確認し、必要に応じて作成
	bucketName := os.Getenv("S3_BUCKET_NAME")
	_, err := svc.HeadBucket(&s3.HeadBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		_, err = svc.CreateBucket(&s3.CreateBucketInput{
			Bucket: aws.String(bucketName),
		})
		if err != nil {
			log.Fatalf("Failed to create bucket: %v", err)
		}
		fmt.Printf("Successfully created bucket %s\n", bucketName)
	}

	// ファイルの内容を読み取る
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	// AESで暗号化
	encryptedData, err := encrypt(fileBytes, "thisis16byteskey")
	if err != nil {
		return fmt.Errorf("failed to encrypt file: %w", err)
	}

	// S3にアップロード
	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(filename),
		Body:   bytes.NewReader(encryptedData),
	})
	if err != nil {
		return fmt.Errorf("failed to upload to S3: %w", err)
	}

	fmt.Printf("Successfully uploaded file %s to S3\n", filename)
	return nil
}

// AES暗号化
func encrypt(data []byte, passPhrase string) ([]byte, error) {
	key := createKey(passPhrase)

	// AESブロック暗号を生成
	block, err := aes.NewCipher(key)
	if err != nil {
		fmt.Println("encrypt block err")
		fmt.Println(err)
		return nil, err
	}

	// Galois/Counter Mode (GCM) を使用するためのインターフェースを生成
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		fmt.Println("encrypt gcm err")
		fmt.Println(err)
		return nil, err
	}

	// GCMのNonce (Number used once) を生成
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		fmt.Println("encrypt readFull err")
		fmt.Println(err)
		return nil, err
	}

	// データを暗号化し、nonceを含む暗号文を生成
	cipherText := gcm.Seal(nonce, nonce, data, nil)

	return cipherText, nil
}

// 鍵の長さを適切な長さにパディングまたはトリミングする関数
func createKey(passPhrase string) []byte {
	key := []byte(passPhrase)
	if len(key) < 16 {
		key = append(key, bytes.Repeat([]byte{0}, 16-len(key))...)
	} else if len(key) > 16 && len(key) < 24 {
		key = append(key, bytes.Repeat([]byte{0}, 24-len(key))...)
	} else if len(key) > 24 && len(key) < 32 {
		key = append(key, bytes.Repeat([]byte{0}, 32-len(key))...)
	} else if len(key) > 32 {
		key = key[:32]
	}
	return key
}

// AES復号化
func decrypt(data []byte, passphrase string) ([]byte, error) {
	// AESブロック暗号を生成
	block, err := aes.NewCipher([]byte(passphrase))
	if err != nil {
		return nil, err
	}

	// Galois/Counter Mode (GCM) を使用するためのインターフェースを生成
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// GCMのNonce (Number used once) サイズを取得
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	// Nonceと暗号文を分割
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]

	// データを復号化し、プレーンテキストを生成
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}
