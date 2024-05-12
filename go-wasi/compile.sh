#!/usr/bin/env bash
set -ex
GOOS=wasip1 GOARCH=wasm  go build -o main.wasm ./main.go
