import { BaseAPI, Config, Media } from "..";
import { MediaType } from "../../types";
import mediaQuery from "./queries/media";
import searchQuery from "./queries/search";

function normalizeMediaFormat(format: string): string {
    switch (format) {
        case "TV":
            return "TV";
        case "TV_SHORT":
            return "TV Short";
        case "MOVIE":
            return "Movie";
        case "SPECIAL":
            return "Special";
        case "OVA":
            return "OVA";
        case "ONA":
            return "ONA";
        case "MUSIC":
            return "Music";
        case "MANGA":
            return "Manga";
        case "NOVEL":
            return "Novel";
        case "ONE_SHOT":
            return "One-shot";
        default:
            return format;
    }
}

function normalizeMediaStatus(status: string): string {
    switch (status) {
        case "FINISHED":
            return "Finished";
        case "RELEASING":
            return "Releasing";
        case "NOT_YET_RELEASED":
            return "Not yet released";
        case "CANCELLED":
            return "Cancelled";
        case "HIATUS":
            return "Hiatus";
        default:
            return status;
    }
}

export class AniList extends BaseAPI {
    title: string = "AniList";
    config: Config = {
        mediaTypes: ["anime", "manga"],
        importableListTypes: [],
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
                            values: [
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
                            values: [
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
                            values: [
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
                            values: [
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

    mediaFromMediaJSON(media: any): Media {
        return new Media(
            media.type.toLowerCase(),
            media.id,
            media.title.romaji,
            media.coverImage.extraLarge,
            media.bannerImage,
            normalizeMediaFormat(media.format),
            normalizeMediaStatus(media.status),
            media.genres,
            media.startDate
                ? new Date(
                      `${media.startDate.year}-${media.startDate.month}-${media.startDate.day}`
                  )
                : null,
            media.endDate
                ? new Date(
                      `${media.endDate.year}-${media.endDate.month}-${media.endDate.day}`
                  )
                : null,
            null,
            null,
            null,
            null,
            media.isAdult,
            [
                `anilist:${
                    media.type.toLowerCase() as MediaType
                }:${media.id.toString()}`,
                ...[
                    media.idMal &&
                        `myanimelist:${
                            media.type.toLowerCase() as MediaType
                        }:${media.idMal.toString()}`,
                ],
            ]
        );
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<[Media[], boolean]> {
        const {
            data: {
                Page: { media: data },
            },
        } = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: searchQuery,
                variables: {
                    type: type.toUpperCase(),
                    sort: options.sortBy,
                    query: options.query,
                    ...(options.seasonYear != ""
                        ? {
                              seasonYear: Number(options.seasonYear),
                          }
                        : {}),
                    ...(options.genre != ""
                        ? {
                              genre: options.genre,
                          }
                        : {}),
                    ...(options.season != ""
                        ? {
                              season: options.season,
                          }
                        : {}),
                    ...(options.format != ""
                        ? {
                              format: options.format,
                          }
                        : {}),
                },
            }),
        }).then((res) => res.json());

        if (!data) {
            return [[], true];
        }

        let media: Media[] = data.map((m: any) => {
            return this.mediaFromMediaJSON(m);
        });

        return [media, false];
    }

    async getMedia(
        type: MediaType,
        { id }: { id: string }
    ): Promise<[Media | null, boolean]> {
        const {
            data: { Media: data },
        } = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: mediaQuery,
                variables: {
                    id: Number(id),
                    type: type,
                },
            }),
        }).then((res) => res.json());

        if (!data) {
            return [null, true];
        }

        let media = this.mediaFromMediaJSON(data.Media);

        return [media, false];
    }
}
