package repository

import (
	"proto-pulse-plat/infrastructure/persistence/postgres"
)

type UsersRepository interface {
	Find(id uint) (postgres.User, error)
}
