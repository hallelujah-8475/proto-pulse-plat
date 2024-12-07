package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelPostImage(fileName string, postID uint) model.PostImage {
	return model.PostImage{
		FileName: fileName,
		PostID:   postID,
	}
}
