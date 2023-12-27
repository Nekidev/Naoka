export default `
query Library($username: String, $type: MediaType, $page: Int) {
    User(name:$username) {
		mediaListOptions {
            scoreFormat
        }
    }
    Page(page: $page, perPage: 50) {
        pageInfo {
            hasNextPage
        }
        mediaList(userName: $username, type: $type) {
            id
            status
            score
            progress
            progressVolumes
            repeat
            startedAt {
                year
                month
                day
            }
            completedAt {
                year
                month
                day
            }
            notes
            updatedAt
            media {
                id
                idMal
                type
                title {
                    romaji
                    native
                    english
                }
                coverImage {
                    extraLarge
                }
                bannerImage
                format
                status
                genres
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                isAdult
                episodes
                chapters
                volumes
                duration
            }
        }
    }
}
`;
