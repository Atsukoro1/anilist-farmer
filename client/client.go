package client

import (
	"net/http"
)

type ClientStr struct {
	// Permanent cookie that will be used to estabilish a session
	RememberMeCookie string

	// Client that will be used to make requests
	HttpClient http.Client

	baseUrl           string
	authorizedBaseUrl string

	// Session that will be used to authorize at protected requests
	LaravelSessionCookie string
	Authorize            func(token string) (bool, error)
	FetchGlobal          func()
}
