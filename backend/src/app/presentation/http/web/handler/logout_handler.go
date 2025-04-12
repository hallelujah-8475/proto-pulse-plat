package handler

import (
	"net/http"
	"time"
)

type LogoutHandler struct {
}

func NewLogoutHandler() *LogoutHandler {
	return &LogoutHandler{}
}
func (oc *LogoutHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",         // 削除したいクッキーの名前
		Value:    "",                   // 値を空にする
		Path:     "/",                  // クッキーが有効なパス
		Expires:  time.Unix(0, 0),      // 過去の日付を設定
		MaxAge:   -1,                   // 最大期限を負に設定
		HttpOnly: false,                // HttpOnly属性がついている場合
		Secure:   true,                // 本番環境では true にする
		SameSite: http.SameSiteLaxMode, // SameSite属性を設定することでセキュリティ強化
	})

	w.WriteHeader(http.StatusOK)
}
