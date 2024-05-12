package main

import (
	"fmt"
	"net/http"

	gotown "github.com/maxmcd/go-town"
)

func main() {
	gotown.ListenAndServe(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello %s", r.URL.Path)
	}))
}
