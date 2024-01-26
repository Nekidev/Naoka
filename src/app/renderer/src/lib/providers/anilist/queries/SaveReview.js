export default `
mutation Review($id: Int, $mediaId: Int, $body: String, $summary: String, $score: int, $private: Boolean) {
    SaveReview(id: $id, mediaId: $mediaId, body: $body, summary: $summary, score: $score, private: $private) {
        id
    }
}
`;
