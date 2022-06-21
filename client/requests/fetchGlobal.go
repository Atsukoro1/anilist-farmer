package requests

import "anilistbot/client"

func FetchGlobal(str *client.ClientStr) {
	const query string = "mutation($id:Int,$type:LikeableType){ToggleLike:ToggleLikeV2(id:$id,type:$type){... on ListActivity{id likeCount isLiked}... on MessageActivity{id likeCount isLiked}... on TextActivity{id likeCount isLiked}... on ActivityReply{id likeCount isLiked}... on Thread{id likeCount isLiked}... on ThreadComment{id likeCount isLiked}}}"
	type Variables struct {
		ID   int    `json:"id"`
		Type string `json:"type"`
	}

	client.MakeRequest(str, query, Variables{ID: 409613355, Type: "ACTIVITY"})
}
