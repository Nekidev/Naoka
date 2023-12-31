export default `
query Search(
    $query: String,
    $sort: MediaSort,
    $type: MediaType,
    $format: MediaFormat,
    $status: MediaStatus,
    $genre: String,
    $season: MediaSeason,
    $seasonYear: Int,
    $countryOfOrigin: CountryCode,
) {
    Page(perPage: 50) {
        media(
            search: $query,
            sort: [$sort],
            type: $type,
            format: $format,
            status: $status,
            genre: $genre,
            season: $season,
            seasonYear: $seasonYear,
            countryOfOrigin: $countryOfOrigin,
        ) {
            id
            idMal
            type
            title {
                romaji
                english
                native
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
}`;
