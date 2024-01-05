import { InputType } from "@/lib/forms";
import { Config } from "../base";

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
            sortBy: [
                {
                    label: "Relevance",
                    value: "",
                },
                {
                    label: "Popularity",
                    value: "popularity",
                },
                {
                    label: "Rank",
                    value: "rank",
                },
                {
                    label: "Rating",
                    value: "score",
                },
                {
                    label: "Title",
                    value: "title",
                },
                {
                    label: "Episodes",
                    value: "episodes",
                },
                {
                    label: "Start date",
                    value: "start_date",
                },
                {
                    label: "End date",
                    value: "end_date",
                },
            ],
            filters: [
                {
                    type: InputType.Select,
                    name: "type",
                    label: "Show type",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "TV",
                            value: "tv",
                        },
                        {
                            label: "Movie",
                            value: "movie",
                        },
                        {
                            label: "OVA",
                            value: "ova",
                        },
                        {
                            label: "Special",
                            value: "special",
                        },
                        {
                            label: "ONA",
                            value: "ona",
                        },
                        {
                            label: "Music",
                            value: "music",
                        },
                    ],
                },
                {
                    type: InputType.Select,
                    name: "rating",
                    label: "Age rating",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "G - All ages",
                            value: "g",
                        },
                        {
                            label: "PG - Children",
                            value: "pg",
                        },
                        {
                            label: "PG-13 - Teens 13 or older",
                            value: "pg13",
                        },
                        {
                            label: "R - 17+ (violence & profanity)",
                            value: "r17",
                        },
                        {
                            label: "R+ - Mild Nudity",
                            value: "r",
                        },
                        {
                            label: "Rx - Hentai",
                            value: "rx",
                        },
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
                            label: "Upcoming",
                            value: "upcoming",
                        },
                        {
                            label: "Airing",
                            value: "airing",
                        },
                        {
                            label: "Complete",
                            value: "complete",
                        },
                    ],
                },
                {
                    type: InputType.CheckboxGroup,
                    name: "sfw",
                    label: "Filter NSFW results",
                    options: [
                        {
                            value: "sfw",
                            label: "Filter NSFW results",
                            defaultChecked: true,
                        },
                    ],
                },
            ],
        },
        manga: {
            sortBy: [
                {
                    label: "Relevance",
                    value: "",
                },
                {
                    label: "Popularity",
                    value: "popularity",
                },
                {
                    label: "Rank",
                    value: "rank",
                },
                {
                    label: "Rating",
                    value: "score",
                },
                {
                    label: "Title",
                    value: "title",
                },
                {
                    label: "Chapters",
                    value: "chapters",
                },
                {
                    label: "Volumes",
                    value: "volumes",
                },
                {
                    label: "Start date",
                    value: "start_date",
                },
                {
                    label: "End date",
                    value: "end_date",
                },
            ],
            filters: [
                {
                    type: InputType.Select,
                    name: "type",
                    label: "Type",
                    options: [
                        {
                            label: "All",
                            value: "",
                        },
                        {
                            label: "Manga",
                            value: "manga",
                        },
                        {
                            label: "Light novel",
                            value: "lightnovel",
                        },
                        {
                            label: "One shot",
                            value: "oneshot",
                        },
                        {
                            label: "Doujinshi",
                            value: "doujin",
                        },
                        {
                            label: "Manhwa",
                            value: "manhwa",
                        },
                        {
                            label: "Manhua",
                            value: "manhua",
                        },
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
                            label: "Upcoming",
                            value: "upcoming",
                        },
                        {
                            label: "Publishing",
                            value: "publishing",
                        },
                        {
                            label: "Hiatus",
                            value: "hiatus",
                        },
                        {
                            label: "Discontinued",
                            value: "discontinued",
                        },
                        {
                            label: "Complete",
                            value: "complete",
                        },
                    ],
                },
                {
                    type: InputType.CheckboxGroup,
                    name: "sfw",
                    label: "Filter NSFW results",
                    options: [
                        {
                            value: "sfw",
                            label: "Filter NSFW results",
                            defaultChecked: true,
                        },
                    ],
                },
            ],
        },
    },
};

export default config;
