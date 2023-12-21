import { ExternalAccount, LibraryEntry, MediaCache, UserData, db } from "@/lib/db";
import { BaseAPI, Config, Media } from "..";
import { LibraryStatus, MediaType } from "../../types";
import userQuery from "./queries/user";
import mediaQuery from "./queries/media";
import searchQuery from "./queries/search";
import libraryQuery from "./queries/library";
import { IntRange } from "@/utils/types";

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

function normalizeLibraryStatus(status: string): LibraryStatus {
    switch (status.toLowerCase()) {
        case "repeating":
        case "current":
            return "in_progress";

        case "planning":
            return "planned";

        case "completed":
            return "completed";

        case "dropped":
            return "dropped";

        case "paused":
            return "paused";

        default:
            return "not_started";
    }
}

export class AniList extends BaseAPI {
    title: string = "AniList";
    config: Config = {
        mediaTypes: ["anime", "manga"],
        importableListTypes: ["anime", "manga"],
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
            media.episodes,
            media.chapters,
            media.volumes,
            media.duration,
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

    async getUser(account: ExternalAccount): Promise<UserData> {
        const { data: { User: data } } = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: userQuery,
                variables: {
                    username: account.auth!.username!,
                },
            }),
        }).then((res) => res.json());

        return {
            id: data.id.toString(),
            name: data.name,
            imageUrl: data.avatar?.large,
        };
    }

    async importList(type: MediaType, account: ExternalAccount, override?: boolean): Promise<void> {
        let hasNextPage = true;
        let page = 1;

        let newMediaCache: MediaCache[] = [];
        let newLibraryEntries: LibraryEntry[] = [];

        while (hasNextPage) {
            const {
                data: {
                    User: {
                        mediaListOptions: {
                            scoreFormat
                        }
                    },
                    Page: {
                        pageInfo,
                        mediaList: data
                    }
                }
            } = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: libraryQuery,
                    variables: {
                        username: account.auth!.username!,
                        type: type.toUpperCase(),
                        page
                    },
                }),
            }).then((res) => res.json());

            hasNextPage = pageInfo.hasNextPage;
            page++;

            let scoreMultiplier: number;

            switch (scoreFormat) {
                case "POINT_100":
                    scoreMultiplier = 1;
                    break;
                
                case "POINT_10":
                case "POINT_10_DECIMAL":
                    scoreMultiplier = 10;
                    break;

                case "POINT_5":
                    scoreMultiplier = 20;
                    break;

                case "POINT_3":
                    scoreMultiplier = 34;
                    break;

                default:
                    scoreMultiplier = 1;
            }

            for (const entry of data) {
                const media = entry.media;

                newMediaCache.push({
                    type: media.type.toLowerCase(),
                    title: media.title.romaji,
                    imageUrl: media.coverImage.extraLarge,
                    bannerUrl: media.bannerImage,
                    startDate: media.startDate ? new Date(`${media.startDate.year}-${media.startDate.month}-${media.startDate.day}`) : null,
                    finishDate: media.endDate ? new Date(`${media.endDate.year}-${media.endDate.month}-${media.endDate.day}`) : null,
                    episodes: media.episodes,
                    chapters: media.chapters,
                    volumes: media.volumes,
                    duration: media.duration,
                    genres: media.genres,
                    isAdult: media.isAdult,
                    mapping: `anilist:${media.type.toLowerCase() as MediaType}:${media.id.toString()}`,
                });

                newLibraryEntries.push({
                    type: media.type.toLowerCase(),
                    favorite: false,
                    status: normalizeLibraryStatus(entry.status),
                    score: Math.min(entry.score * scoreMultiplier, 100) as IntRange<1,100>,
                    restarts: entry.repeats,
                    startDate: entry.startDate ? new Date(`${entry.startDate.year}-${entry.startDate.month}-${entry.startDate.day}`) : null,
                    finishDate: entry.endDate ? new Date(`${entry.endDate.year}-${entry.endDate.month}-${entry.endDate.day}`) : null,
                    episodeProgress: entry.progress,
                    chapterProgress: entry.progress,
                    volumeProgress: entry.progressVolumes,
                    notes: entry.notes,
                    mapping: `anilist:${media.type.toLowerCase() as MediaType}:${media.id.toString()}`,
                })
            }
        }

        await db.mediaCache.bulkPut(newMediaCache);

        if (override) {
            await db.library.bulkPut(newLibraryEntries);
        } else {
            try {
                // Will only add items that don't exist. If there is one or
                // more items that already exist, it will throw an error but
                // still add the rest of the items.
                await db.library.bulkAdd(newLibraryEntries);
            } catch (e) {
                console.log(e);
                null;
            }
        }
    }
}
