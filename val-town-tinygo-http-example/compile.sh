#!/usr/bin/env bash
set -ex
# GOOS=js GOARCH=wasm  go build -o main.wasm ./main.go

tinygo build -o main.wasm -target=wasi .
wasm-strip ./main.wasm