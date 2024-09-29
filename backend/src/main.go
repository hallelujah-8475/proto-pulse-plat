package main

import (
	"fmt"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	// ブラウザに "Hello, World!" を表示
	fmt.Fprintln(w, "Hello, World!")
}

func main() {
	// "/hello" というパスにハンドラーを登録
	http.HandleFunc("/hello", helloHandler)

	// サーバーを開始
	fmt.Println("Starting server on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		// サーバーの起動に失敗した場合のエラーハンドリング
		fmt.Println("Error starting server:", err)
	}
}
