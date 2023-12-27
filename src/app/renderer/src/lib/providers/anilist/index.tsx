import {
    ExternalAccount,
    LibraryEntry,
    Media,
    MediaFormat,
    MediaGenre,
    MediaStatus,
    UserData,
} from "@/lib/db";
import { LibraryStatus, Mapping, MediaType } from "../../types";
import userQuery from "./queries/user";
import mediaQuery from "./queries/media";
import searchQuery from "./queries/search";
import libraryQuery from "./queries/library";
import config from "./config";
import { BaseProvider } from "../base";

function normalizeGenre(genre: string): MediaGenre | undefined {
    return {
        action: MediaGenre.Action,
        adventure: MediaGenre.Adventure,
        comedy: MediaGenre.Comedy,
        drama: MediaGenre.Drama,
        ecchi: MediaGenre.Ecchi,
        fantasy: MediaGenre.Fantasy,
        horror: MediaGenre.Horror,
        "mahou shoujo": MediaGenre.MahouShoujo,
        mecha: MediaGenre.Mecha,
        music: MediaGenre.Music,
        mistery: MediaGenre.Mistery,
        psychological: MediaGenre.Psychological,
        romance: MediaGenre.Romance,
        "sci-fi": MediaGenre.SciFi,
        "slice of life": MediaGenre.SliceOfLife,
        sports: MediaGenre.Sports,
        supernatural: MediaGenre.Supernatural,
        thriller: MediaGenre.Thriller,
    }[genre.toLowerCase()];
}

function normalizeMediaFormat(format: string): MediaFormat | undefined {
    return {
        tv: MediaFormat.Tv,
        tv_short: MediaFormat.TvShort,
        movie: MediaFormat.Movie,
        special: MediaFormat.Special,
        ona: MediaFormat.Ona,
        ova: MediaFormat.Ova,
        music: MediaFormat.Music,
        manga: MediaFormat.Manga,
        novel: MediaFormat.Novel,
        one_shot: MediaFormat.OneShot,
    }[format.toLowerCase()];
}

function normalizeMediaStatus(status: string): MediaStatus | undefined {
    return {
        finished: MediaStatus.Finished,
        releasing: MediaStatus.InProgress,
        not_yet_released: MediaStatus.NotStarted,
        cancelled: MediaStatus.Cancelled,
        hiatus: MediaStatus.Hiatus,
    }[status.toLowerCase()];
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

export class AniList extends BaseProvider {
    name: string = "AniList";
    config = config;

    mediaToInternalValue(media: any): {
        media: Media;
        mappings: Mapping[];
    } {
        return {
            media: {
                type: media.type.toLowerCase() as MediaType,
                title: {
                    romaji: media.title.romaji,
                    english: media.title.english,
                    native: media.title.native,
                },
                imageUrl: media.coverImage.extraLarge,
                bannerUrl: media.bannerImage,
                startDate: media.startDate
                    ? new Date(
                          `${media.startDate.year}-${media.startDate.month}-${media.startDate.day}`
                      )
                    : null,
                finishDate: media.endDate
                    ? new Date(
                          `${media.endDate.year}-${media.endDate.month}-${media.endDate.day}`
                      )
                    : null,
                genres: media.genres
                    .map((genre: string) => normalizeGenre(genre))
                    .filter((genre: MediaGenre | undefined) => !!genre),
                format: normalizeMediaFormat(media.format) || null,
                status: normalizeMediaStatus(media.status) || null,
                episodes: media.episodes,
                chapters: media.chapters,
                volumes: media.volumes,
                duration: media.duration,
                mapping: `anilist:${
                    media.type.toLowerCase() as MediaType
                }:${media.id.toString()}`,
            },
            mappings: [
                `anilist:${
                    media.type.toLowerCase() as MediaType
                }:${media.id.toString()}`,
                ...(media.idMal
                    ? [
                          `myanimelist:${
                              media.type.toLowerCase() as MediaType
                          }:${media.idMal.toString()}` as Mapping,
                      ]
                    : []),
            ],
        };
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<{
        media: Media[];
        mappings: Mapping[][];
    }> {
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
            throw Error("Failed to search");
        }

        let mappings: Mapping[][] = [];
        let media: Media[] = data.map((v: any) => {
            const { media, mappings: m } = this.mediaToInternalValue(v);
            mappings.push(m);
            return media;
        });

        return {
            media,
            mappings,
        };
    }

    async getMedia(
        type: MediaType,
        id: string
    ): Promise<{
        media: Media;
        mappings: Mapping[];
    }> {
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
            throw Error("Failed to get media");
        }

        return this.mediaToInternalValue(data.Media);
    }

    async getUser(account: ExternalAccount): Promise<UserData> {
        const {
            data: { User: data },
        } = await fetch("https://graphql.anilist.co", {
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

    async getLibrary(
        type: MediaType,
        account: ExternalAccount
    ): Promise<{
        media: Media[];
        mappings: Mapping[][];
        entries: LibraryEntry[];
    }> {
        let hasNextPage = true;
        let page = 1;

        let newMedia: Media[] = [];
        let newMappings: Mapping[][] = [];
        let newLibraryEntries: LibraryEntry[] = [];

        while (hasNextPage) {
            const {
                data: {
                    User: {
                        mediaListOptions: { scoreFormat },
                    },
                    Page: { pageInfo, mediaList: data },
                },
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
                        page,
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
                const { media, mappings } = this.mediaToInternalValue(
                    entry.media
                );

                newMedia.push(media);
                newMappings.push(mappings);

                newLibraryEntries.push({
                    type: media.type.toLowerCase() as MediaType,
                    favorite: false,
                    status: normalizeLibraryStatus(entry.status),
                    score: Math.min(entry.score * scoreMultiplier, 100),
                    restarts: entry.repeats,
                    startDate: entry.startDate
                        ? new Date(
                              `${entry.startDate.year}-${entry.startDate.month}-${entry.startDate.day}`
                          )
                        : null,
                    finishDate: entry.endDate
                        ? new Date(
                              `${entry.endDate.year}-${entry.endDate.month}-${entry.endDate.day}`
                          )
                        : null,
                    episodeProgress: entry.progress,
                    chapterProgress: entry.progress,
                    volumeProgress: entry.progressVolumes,
                    notes: entry.notes,
                    mapping: media.mapping,
                    updatedAt: new Date(entry.updatedAt),
                });
            }
        }

        return {
            media: newMedia,
            mappings: newMappings,
            entries: newLibraryEntries,
        };
    }
}
