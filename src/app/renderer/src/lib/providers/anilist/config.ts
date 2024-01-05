import { InputType } from "@/lib/forms";
import { Config } from "../base";

const sortBy = [
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
];

const config: Config = {
    mediaTypes: ["anime", "manga"],
    syncing: {
        auth: {
            type: "oauth",
        },
        import: {
            mediaTypes: ["anime", "manga"],
        },
    },
    search: {
        anime: {
            sortBy,
            filters: [
                {
                    type: InputType.Select,
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
                {
                    type: InputType.Select,
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
                {
                    type: InputType.Select,
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
                {
                    type: InputType.Select,
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
            ],
        },
        manga: {
            sortBy,
            filters: [
                {
                    type: InputType.Select,
                    name: "format",
                    label: "Format",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "Manga",
                            value: "MANGA",
                        },
                        {
                            label: "Light Novel",
                            value: "LIGHT_NOVEL",
                        },
                        {
                            label: "One-shot",
                            value: "ONE_SHOT",
                        },
                    ],
                },
                {
                    type: InputType.Select,
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
                {
                    type: InputType.Select,
                    name: "status",
                    label: "Status",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "Releasing",
                            value: "RELEASING",
                        },
                        {
                            label: "Finished",
                            value: "FINISHED",
                        },
                        {
                            label: "Not Yet Released",
                            value: "NOT_YET_RELEASED",
                        },
                        {
                            label: "Hiatus",
                            value: "HIATUS",
                        },
                        {
                            label: "Cancelled",
                            value: "CANCELLED",
                        },
                    ],
                },
                {
                    type: InputType.Select,
                    name: "countryOfOrigin",
                    label: "Country of Origin",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "Japan",
                            value: "JP",
                        },
                        {
                            label: "China",
                            value: "CN",
                        },
                        {
                            label: "Taiwan",
                            value: "TW",
                        },
                        {
                            label: "South Korea",
                            value: "KR",
                        },
                    ],
                },
            ],
        },
    },
};

export default config;
