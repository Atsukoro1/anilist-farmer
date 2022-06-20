package client

import (
	"fmt"
	"net/http"
	"strings"
)

/*
	Send request to anilist graphql api
*/
func MakeRequest(
	client *ClientStr,
	query string,
	variables any,
) (error, any) {
	reader := strings.NewReader("")

	req, _ := http.NewRequest(
		"POST",
		client.authorizedBaseUrl,
		reader,
	)

	res, err := client.HttpClient.Do(req)
	if err != nil {
		return err, nil
	}

	fmt.Println(res.Body)

	return nil, res.Body
}
