package client

import (
	"fmt"
	"net/http"
	"reflect"
)

/*
	Initialize Client instance

	Init function will load other functions that are required
	for client to work correctly

	Returns the client instance
*/
func (str *ClientStr) Init() *ClientStr {
	str.baseUrl = "https://anilist.co"
	str.authorizedBaseUrl = "https://graphql.anilist.co"
	str.HttpClient = http.Client{}

	str.FetchGlobal = func() {
		const query string = "mutation($id:Int,$type:LikeableType){ToggleLike:ToggleLikeV2(id:$id,type:$type){... on ListActivity{id likeCount isLiked}... on MessageActivity{id likeCount isLiked}... on TextActivity{id likeCount isLiked}... on ActivityReply{id likeCount isLiked}... on Thread{id likeCount isLiked}... on ThreadComment{id likeCount isLiked}}}"
		type Variables struct {
			ID   int    `json:"id"`
			Type string `json:"type"`
		}
		MakeRequest(str, query, Variables{ID: 409613355, Type: "ACTIVITY"})
	}

	str.Authorize = func(token string) (bool, error) {
		str.RememberMeCookie = token

		cookie := http.Cookie{
			Name:     "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
			Value:    token,
			HttpOnly: true,
		}

		req, _ := http.NewRequest(
			"POST",
			fmt.Sprintf("%s/404", str.baseUrl),
			nil,
		)

		req.AddCookie(&cookie)
		req.Header.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0")
		req.Header.Add("Connection", "close")
		req.Header.Add("Content-Type", "application/json")

		res, err := str.HttpClient.Do(req)
		if err != nil {
			return false, err
		}

		for i := range res.Cookies() {
			if res.Cookies()[i].Name == "laravel_session" {
				str.LaravelSessionCookie = res.Cookies()[i].Value
			}
		}

		return reflect.TypeOf(
			str.LaravelSessionCookie,
		).Kind() == reflect.String, nil
	}

	return str
}
