package gotown

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"unsafe"
)

func pack(buffer []byte) uint64 {
	bufferPtr := &buffer[0]
	unsafePtr := uintptr(unsafe.Pointer(bufferPtr))

	ptr := uint32(unsafePtr)
	size := uint32(len(buffer))

	return (uint64(ptr) << uint64(32)) | uint64(size)
}

//export alloc
func alloc(size uint32) *byte {
	buf := make([]byte, size)
	return &buf[0]
}

func read(subjectPosition *uint32, length int) []byte {
	subjectBuffer := make([]byte, length)
	pointer := uintptr(unsafe.Pointer(subjectPosition))
	for i := 0; i < length; i++ {
		s := *(*int32)(unsafe.Pointer(pointer + uintptr(i)))
		subjectBuffer[i] = byte(s)
	}
	return subjectBuffer
}

var handlerFunction func(param []byte) ([]byte, error)

func setHandler(function func(param []byte) ([]byte, error)) {
	handlerFunction = function
}

//export callHandler
func callHandler(subjectPosition *uint32, length int) uint64 {
	subjectBytes := read(subjectPosition, length)
	retValue, err := handlerFunction(subjectBytes)

	if err != nil {
		// first byte == 69
		return pack([]byte("E" + err.Error()))
	} else {
		// first byte == 82
		return pack(append([]byte("R"), retValue...))
	}
}

type request struct {
	Body    []byte            `json:"body"`
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
}

func (r *request) ToHTTPRequest() *http.Request {
	var body io.Reader = nil
	if len(r.Body) > 0 {
		body = bytes.NewReader(r.Body)
	}
	req, _ := http.NewRequest(r.Method, r.Url, body)
	for key, value := range r.Headers {
		req.Header.Add(key, value)
	}
	return req
}

type response struct {
	Body    []byte              `json:"body"`
	Headers map[string][]string `json:"headers"`
	Status  int                 `json:"status"`
}

var _ http.ResponseWriter = &response{}

func (r *response) Header() http.Header {
	return r.Headers
}
func (r *response) Write(b []byte) (int, error) {
	if r.Status == 0 {
		r.Status = http.StatusOK
	}
	r.Body = append(r.Body, b...)
	return len(b), nil
}
func (r *response) WriteHeader(statusCode int) {
	r.Status = statusCode
}

func ListenAndServe(handler http.Handler) {
	setHandler(func(param []byte) ([]byte, error) {
		var p request
		if err := json.Unmarshal(param, &p); err != nil {
			return nil, err
		}
		res := &response{Headers: map[string][]string{}}
		handler.ServeHTTP(res, p.ToHTTPRequest())
		if _, ok := res.Headers["Content-Type"]; !ok {
			mimeType := http.DetectContentType(res.Body)
			res.Headers["Content-Type"] = []string{mimeType}
		}
		return json.Marshal(res)
	})
}
