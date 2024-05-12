package main

import (
	"fmt"
	"net/http"

	gotown "github.com/maxmcd/go-town"
)

func main() {
	img := renderImage()
	gotown.ListenAndServe(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/mandelbrot.png" {
			w.Header().Set("Content-Type", "image/png")
			w.Write(img)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, `
			<head><link rel="icon" href="/mandelbrot.png"></head>
			<style>body {font-family: sans-serif}</style>
			Go-Rendered mandelbrot image served from a Go HTTP handler <a href="https://www.val.town/v/maxm/tinygoHttpExample">on Val Town</a>
			<br /><img src='/mandelbrot.png' />
		`)
	}))
}
