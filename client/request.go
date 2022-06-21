package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

/*
	Send request to anilist graphql api
*/
func MakeRequest(
	client *ClientStr,
	query string,
	variables any,
) (error, any) {
	sessionC := http.Cookie{
		Name:     "laravel_session",
		Value:    client.LaravelSessionCookie,
		HttpOnly: true,
	}

	requestWebC := http.Cookie{
		Name:     "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
		Value:    client.RememberMeCookie,
		HttpOnly: true,
	}

	strVar, _ := json.Marshal(variables)
	var body string = "{ \"query\": " + "\"" + query + "\"" + ", \"variables\": " + string(strVar) + " }"
	req, _ := http.NewRequest(
		"POST",
		client.authorizedBaseUrl+"/graphql",
		bytes.NewBuffer([]byte(body)),
	)
	req.AddCookie(&sessionC)
	req.AddCookie(&requestWebC)
	req.Header.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0")
	req.Header.Add("Connection", "Close")
	req.Header.Add("Content-Type", "application/json")

	res, err := client.HttpClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return err, nil
	}

	st, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return err, nil
	}

	fmt.Println(res.Request.Cookie("laravel_session"))
	fmt.Println(res.Request.Cookie("remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d"))
	fmt.Println(string(st))

	return nil, res.Body
}
