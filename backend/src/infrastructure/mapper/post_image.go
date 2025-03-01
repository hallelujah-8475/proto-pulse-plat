package mapper

import (
	"proto-pulse-plat/infrastructure/model"
)

func ToModelPostImage(fileName string, postID uint, datas []byte) model.PostImage {
	return model.PostImage{
		FileName: fileName,
		PostID:   postID,
		Data:     datas,
	}
}
