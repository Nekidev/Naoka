const query = `
query Media($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
        id
        idMal
        type
        title {
            romaji
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

export default query;
