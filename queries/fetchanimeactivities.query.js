export default `
query ($id: Int, $page: Int) {
    Page(page: $page, perPage: 10) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      activities(mediaId: $id, sort: ID_DESC, type: MEDIA_LIST) {
        ... on ListActivity {
          id
          userId
          type
          status
          progress
          replyCount
          isLocked
          isSubscribed
          isLiked
          likeCount
          createdAt
          user {
            id
            name
            avatar {
              large
            }
          }
          media {
            id
            type
            bannerImage
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;