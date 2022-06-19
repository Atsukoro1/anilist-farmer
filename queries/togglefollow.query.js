export default `
mutation ($id: Int) {
    ToggleFollow(userId: $id) {
      id
      name
      isFollowing
    }
  }
`