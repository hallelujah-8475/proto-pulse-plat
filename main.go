package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Hello Go")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
