package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println(http.Get("https://www.google.com/"))
}
