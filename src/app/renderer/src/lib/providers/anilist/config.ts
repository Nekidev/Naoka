import { Config } from "..";

const config: Config = {
    mediaTypes: ["anime", "manga"],
    syncing: {
        auth: {
            type: "oauth",
        },
        import: {
            mediaTypes: ["anime", "manga"]
        }
    },
    search: {
        anime: {
            sortBy: [
                {
                    label: "Match",
                    value: "SEARCH_MATCH",
                },
                {
                    label: "Score",
                    value: "SCORE_DESC",
                },
                {
                    label: "Popularity",
                    value: "POPULARITY_DESC",
                },
                {
                    label: "Trending",
                    value: "TRENDING_DESC",
                },
                {
                    label: "Favorites",
                    value: "FAVOURITES_DESC",
                },
                {
                    label: "Status",
                    value: "STATUS",
                },
                {
                    label: "Start date",
                    value: "START_DATE",
                },
                {
                    label: "End date",
                    value: "END_DATE",
                },
            ],
            filters: [
                {
                    type: "select",
                    value: {
                        name: "format",
                        label: "Format",
                        options: [
                            {
                                label: "All",
                                value: "",
                            },
                            {
                                label: "TV",
                                value: "TV",
                            },
                            {
                                label: "TV Short",
                                value: "TV_SHORT",
                            },
                            {
                                label: "Movie",
                                value: "MOVIE",
                            },
                            {
                                label: "Special",
                                value: "SPECIAL",
                            },
                            {
                                label: "OVA",
                                value: "OVA",
                            },
                            {
                                label: "ONA",
                                value: "ONA",
                            },
                            {
                                label: "Music",
                                value: "MUSIC",
                            },
                        ],
                    },
                },
                {
                    type: "select",
                    value: {
                        name: "genre",
                        label: "Genre",
                        options: [
                            {
                                label: "All",
                                value: "",
                            },
                            ...[
                                "Action",
                                "Adventure",
                                "Comedy",
                                "Drama",
                                "Ecchi",
                                "Fantasy",
                                "Horror",
                                "Mahou Shoujo",
                                "Mecha",
                                "Music",
                                "Mistery",
                                "Psychologycal",
                                "Romance",
                                "Sci-Fi",
                                "Slice of Life",
                                "Sports",
                                "Supernatural",
                                "Thriller",
                            ].map((genre: string) => ({
                                label: genre,
                                value: genre,
                            })),
                        ],
                    },
                },
                {
                    type: "select",
                    value: {
                        name: "season",
                        label: "Season",
                        options: [
                            {
                                label: "All",
                                value: "",
                            },
                            {
                                label: "Summer",
                                value: "SUMMER",
                            },
                            {
                                label: "Winter",
                                value: "WINTER",
                            },
                            {
                                label: "Spring",
                                value: "SPRING",
                            },
                            {
                                label: "Fall",
                                value: "FALL",
                            },
                        ],
                    },
                },
                {
                    type: "select",
                    value: {
                        name: "seasonYear",
                        label: "Season Year",
                        options: [
                            {
                                label: "All",
                                value: "",
                            },
                            ...Array.from({
                                length: new Date().getFullYear() - 1940 + 2,
                            })
                                .map((_, index: number) => {
                                    return {
                                        label: `${1940 + index}`,
                                        value: `${1940 + index}`,
                                    };
                                })
                                .reverse(),
                        ],
                    },
                },
            ],
        },
        manga: {
            filters: [],
        },
    },
};

export default config;
