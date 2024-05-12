package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	var cb js.Func
	cb = js.FuncOf(func(this js.Value, args []js.Value) any {
		fmt.Println("thing done")
		return nil
	})
	js.Global().Get("gotown").Call("registerHTTPHandler", cb)
}
