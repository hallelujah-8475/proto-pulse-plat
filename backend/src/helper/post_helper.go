package helper

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"proto-pulse-plat/domain/entity"
	"proto-pulse-plat/infrastructure/model"
	"proto-pulse-plat/infrastructure/response"
	"strings"
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
			ContentTitle:    post.ContentTitle,
			Location:        post.Location,
			PostImageBase64: postImageBase64,
			UserName:        user.UserName,
			AccountID:       user.AccountID,
			IconImageBase64: fmt.Sprintf(
				"data:%s;base64,%s",
				getImageBase64(user.IconFileName),
				base64.StdEncoding.EncodeToString(user.IconData)),
			IsOwnPost: loginUser != nil && user.UserName == loginUser.ScreenName,
			UserID:    user.ID,
			CreatedAt: post.CreatedAt.Format("2006年01月02日"),
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
		)
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
