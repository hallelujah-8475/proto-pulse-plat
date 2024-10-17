package repository

type PostRepository interface {
	Delete(postID int) error
}
