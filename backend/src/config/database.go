package config

import (
	"fmt"
)

var (
    host     = getEnv("POSTGRES_HOST", "postgres_container")
    user     = getEnv("POSTGRES_USER", "myuser")
    password = getEnv("POSTGRES_PASSWORD", "mypassword")
    dbname   = getEnv("POSTGRES_DBNAME", "mydatabase")
    port     = getEnv("POSTGRES_PORT", "5432")
    sslmode  = getEnv("POSTGRES_SSLMODE", "disable")
    timezone = getEnv("POSTGRES_TIMEZONE", "Asia/Tokyo")
)

func GetDSN() string {
    dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
        host, user, password, dbname, port, sslmode, timezone)
    return dsn
}