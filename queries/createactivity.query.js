export default `
mutation ($id: Int, $text: String, $isLocked: Boolean) {
    SaveTextActivity(id: $id, text: $text, locked: $isLocked) {
      id
      type
      text
      replyCount
      isLocked
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