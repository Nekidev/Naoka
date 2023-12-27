export default `
query Media($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
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
`;
