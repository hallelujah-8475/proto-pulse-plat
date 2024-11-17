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
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func GetPostBase64Image(iconURL string) string {
	iconURL = "twitter_icon.png"
	fmt.Println(iconURL)
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
		Key:    aws.String(iconURL),
	})
	if err != nil {
		fmt.Println("failed to get object from S3", err)
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

	// 画像データをBase64エンコード
	encodedImage := base64.StdEncoding.EncodeToString(buf.Bytes())

	// レスポンスボディにBase64エンコードされた画像データを含める
	// response := fmt.Sprintf(`{"image": "%s"}`, encodedImage)
	response := fmt.Sprintf("data:%s;base64,%s", getImageBase64(iconURL), encodedImage)

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
