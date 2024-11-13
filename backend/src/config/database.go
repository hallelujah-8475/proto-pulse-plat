package config

import (
	"fmt"
)

var (
	host     = GetEnv("POSTGRES_HOST", "postgres_container")
	user     = GetEnv("POSTGRES_USER", "myuser")
	password = GetEnv("POSTGRES_PASSWORD", "mypassword")
	dbname   = GetEnv("POSTGRES_DBNAME", "mydatabase")
	port     = GetEnv("POSTGRES_PORT", "5432")
	sslmode  = GetEnv("POSTGRES_SSLMODE", "disable")
	timezone = GetEnv("POSTGRES_TIMEZONE", "Asia/Tokyo")
)

func GetDSN() string {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, dbname, port, sslmode, timezone)
	return dsn
}
