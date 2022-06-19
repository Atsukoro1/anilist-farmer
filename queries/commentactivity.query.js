export default `
mutation ($id: Int, $activityId: Int, $text: String, $asMod: Boolean) {
    SaveActivityReply(id: $id, activityId: $activityId, text: $text, asMod: $asMod) {
      id
      activityId
      text
      likeCount
      createdAt
      user {
        id
        name
        avatar {
          large
        }
      }
    }
  }
`