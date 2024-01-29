import { BaseProvider, Config } from "@/lib/providers/base";
import { serializeURL } from "@/lib/utils";
import { Body, fetch } from "@tauri-apps/api/http";
import config from "./config";
import {
    ExternalAccount,
    LibraryEntry,
    LibraryStatus,
    Mapping,
    Media,
    MediaFormat,
    MediaGenre,
    MediaRating,
    MediaStatus,
    MediaType,
    UserData,
} from "@/lib/db/types";
import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";

function normalizeTime(timeString: string) {
    const parts = timeString.split(" ");

    let totalSeconds = 0;

    for (let i = 0; i < parts.length; i += 2) {
        const value = parseInt(parts[i]);
        const unit = parts[i + 1];

        switch (unit) {
            case "hr":
            case "hrs":
                totalSeconds += value * 3600;
                break;
            case "min":
            case "mins":
                totalSeconds += value * 60;
                break;
            case "sec":
            case "secs":
                totalSeconds += value;
                break;
            default:
                break;
        }
    }

    return totalSeconds;
}

function normalizeGenre(genre: string): MediaGenre | undefined {
    return {
        action: MediaGenre.Action,
        adventure: MediaGenre.Adventure,
        "avant garde": MediaGenre.AvantGarde,
        "award winning": MediaGenre.AwardWinning,
        "boys love": MediaGenre.Yaoi,
        comedy: MediaGenre.Comedy,
        drama: MediaGenre.Drama,
        fantasy: MediaGenre.Fantasy,
        "girls love": MediaGenre.Yuri,
        gourmet: MediaGenre.Gourmet,
        horror: MediaGenre.Horror,
        mistery: MediaGenre.Mistery,
        romance: MediaGenre.Romance,
        "sci-fi": MediaGenre.SciFi,
        "slice of life": MediaGenre.SliceOfLife,
        sports: MediaGenre.Sports,
        supernatural: MediaGenre.Supernatural,
        suspense: MediaGenre.Suspense,
    }[genre.toLowerCase()];
}

function normalizeLibraryStatus(status: string): LibraryStatus {
    switch (status) {
        case "reading":
        case "watching":
            return LibraryStatus.InProgress;

        case "completed":
            return LibraryStatus.Completed;

        case "on_hold":
            return LibraryStatus.Paused;

        case "dropped":
            return LibraryStatus.Dropped;

        case "plan_to_read":
        case "plan_to_watch":
            return LibraryStatus.Planned;

        default:
            return LibraryStatus.NotStarted;
    }
}

function normalizeJikanStatus(status: string): MediaStatus | undefined {
    return {
        "not yet started": MediaStatus.NotStarted,
        "currently airing": MediaStatus.InProgress,
        "finished airing": MediaStatus.Finished,
    }[status.toLowerCase()];
}

function normalizeMalStatus(status: string): MediaStatus | undefined {
    return {
        not_yet_started: MediaStatus.NotStarted,
        currently_airing: MediaStatus.InProgress,
        finished_airing: MediaStatus.Finished,
    }[status.toLowerCase()];
}

function normalizeFormat(format: string): MediaFormat | undefined {
    return {
        tv: MediaFormat.Tv,
        movie: MediaFormat.Movie,
        special: MediaFormat.Special,
        ova: MediaFormat.Ova,
        ona: MediaFormat.Ona,
        music: MediaFormat.Music,
        manga: MediaFormat.Manga,
        novel: MediaFormat.Novel,
        one_shot: MediaFormat.OneShot,
        doujinshi: MediaFormat.Doujinshi,
        manhwa: MediaFormat.Manhwa,
        manhua: MediaFormat.Manhua,
        oel: MediaFormat.Oel,
        unknown: MediaFormat.Unknown,
    }[format.toLowerCase()];
}

function normalizeMalRating(rating: string): MediaRating | undefined {
    return {
        g: MediaRating.G,
        pg: MediaRating.PG,
        "pg-13": MediaRating.PG13,
        r: MediaRating.R,
        "r+": MediaRating.RPlus,
        rx: MediaRating.Rx,
    }[rating.toLowerCase().split("-")[0]];
}

function normalizeJikanRating(rating: string): MediaRating | undefined {
    return {
        "G - All Ages": MediaRating.G,
        "PG - Children": MediaRating.PG,
        "PG-13 - Teens 13 or older": MediaRating.PG13,
        "R - 17+ (violence & profanity)": MediaRating.R,
        "R+ - Mild Nudity": MediaRating.RPlus,
        "Rx - Hentai": MediaRating.Rx,
    }[rating];
}

export class MyAnimeList extends BaseProvider {
    name: string = "MyAnimeList";
    config: Config = config;

    private jikanAnimeToInteralValue(anime: any): {
        media: Media;
        mappings: Mapping[];
    } {
        return {
            media: {
                type: "anime",
                title: {
                    romaji: anime.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Default"
                    )?.title,
                    english: anime.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "English"
                    )?.title,
                    native: anime.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Japanese"
                    )?.title,
                },
                imageUrl: anime.images.webp.large_image_url,
                bannerUrl: null,
                episodes: anime.episodes,
                startDate: anime.aired.from ? new Date(anime.aired.from) : null,
                finishDate: anime.aired.to ? new Date(anime.aired.to) : null,
                genres: anime.genres
                    .map((value: { name: string }) =>
                        normalizeGenre(value.name)
                    )
                    .filter((genre: string | undefined) => !!genre),
                status: normalizeJikanStatus(anime.status) || null,
                format: anime.type ? normalizeFormat(anime.type)! : null,
                duration: anime.duration ? normalizeTime(anime.duration) : null,
                rating: anime.rating
                    ? normalizeJikanRating(anime.rating)
                    : null,
                mapping: `myanimelist:anime:${anime.mal_id}`,
            },
            mappings: [`myanimelist:anime:${anime.mal_id}`],
        };
    }

    private malAnimeToInternalValue(anime: any): {
        media: Media;
        mappings: Mapping[];
    } {
        return {
            media: {
                type: "anime",
                title: {
                    romaji: anime.title,
                    english: anime.alternative_titles.en,
                    native: anime.alternative_titles.ja,
                },
                imageUrl: anime.main_picture?.large,
                bannerUrl: null,
                episodes: anime.num_episodes,
                startDate: anime.start_date ? new Date(anime.start_date) : null,
                finishDate: anime.end_date ? new Date(anime.end_date) : null,
                genres: anime.genres
                    .map((genre: any) => normalizeGenre(genre.name))
                    .filter((genre: string | undefined) => !!genre),
                status: anime.status ? normalizeMalStatus(anime.status)! : null,
                format: anime.media_type
                    ? normalizeFormat(anime.media_type)!
                    : null,
                duration: anime.average_episode_duration
                    ? Math.round(anime.average_episode_duration / 60)
                    : null,
                rating: anime.rating ? normalizeMalRating(anime.rating) : null,
                isAdult: anime.nsfw == "black",
                mapping: `myanimelist:anime:${anime.id.toString()}`,
            },
            mappings: [`myanimelist:anime:${anime.id.toString()}`],
        };
    }

    private jikanMangaToInternalValue(manga: any): {
        media: Media;
        mappings: Mapping[];
    } {
        return {
            media: {
                type: "manga",
                title: {
                    romaji: manga.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Default"
                    )?.title,
                    english: manga.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "English"
                    )?.title,
                    native: manga.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Japanese"
                    )?.title,
                },
                imageUrl: manga.images.webp.large_image_url,
                bannerUrl: null,
                chapters: manga.chapters,
                volumes: manga.volumes,
                startDate: manga.published.from
                    ? new Date(manga.published.from)
                    : null,
                finishDate: manga.published.to
                    ? new Date(manga.published.to)
                    : null,
                genres: manga.genres
                    .map((value: { name: string }) =>
                        normalizeGenre(value.name)
                    )
                    .filter((genre: string | undefined) => !!genre),
                status: normalizeJikanStatus(manga.status) || null,
                format: manga.type ? normalizeFormat(manga.type)! : null,
                mapping: `myanimelist:manga:${manga.mal_id}`,
            },
            mappings: [`myanimelist:manga:${manga.mal_id}`],
        };
    }

    private malMangaToInternalValue(manga: any): {
        media: Media;
        mappings: Mapping[];
    } {
        return {
            media: {
                type: "manga",
                title: {
                    romaji: manga.title,
                    english: manga.alternative_titles.en,
                    native: manga.alternative_titles.ja,
                },
                imageUrl: manga.main_picture?.large,
                bannerUrl: null,
                chapters: manga.num_chapters,
                volumes: manga.num_volumes,
                startDate: manga.start_date ? new Date(manga.start_date) : null,
                finishDate: manga.end_date ? new Date(manga.end_date) : null,
                genres: manga.genres
                    .map((genre: any) => normalizeGenre(genre.name))
                    .filter((genre: string | undefined) => !!genre),
                status: manga.status ? normalizeMalStatus(manga.status)! : null,
                format: manga.media_type
                    ? normalizeFormat(manga.media_type)!
                    : null,
                isAdult: manga.nsfw == "black",
                mapping: `myanimelist:manga:${manga.id.toString()}`,
            },
            mappings: [`myanimelist:manga:${manga.id.toString()}`],
        };
    }

    private libraryEntryToInternalValue(
        entry: any,
        mapping: Mapping
    ): LibraryEntry {
        return new LibraryEntry({
            type: mapping.split(":", 2)[1] as MediaType,
            favorite: false,
            status: normalizeLibraryStatus(entry.status),
            score: entry.score * 10,
            episodeProgress: entry.num_episodes_watched,
            chapterProgress: entry.num_chapters_read,
            volumeProgress: entry.num_volumes_read,
            restarts: entry.num_times_rewatched,
            startDate: entry.start_date ? new Date(entry.start_date) : null,
            finishDate: entry.finish_date ? new Date(entry.finish_date) : null,
            notes: entry.comments,
            isPrivate: false,
            updatedAt: new Date(entry.updated_at),
            mapping,
            missedSyncs: [],
        });
    }

    private async searchAnime(options: {
        [key: string]: any;
    }): Promise<{ media: Media[]; mappings: Mapping[][] }> {
        let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
            options.query
        )}`;

        if (options.sortBy != null) {
            url += `&order_by=${options.sortBy}&sort=asc`;
        }

        if (!options.adult) {
            url += "&sfw";
        }

        delete options.query;
        delete options.sortBy;
        delete options.adult;

        url += `&${serializeURL(options)}`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get anime");
        }

        let mappings: Mapping[][] = [];
        let animes: Media[] = res.data.data.map((anime: any) => {
            const { media, mappings: m } = this.jikanAnimeToInteralValue(anime);

            mappings.push(m);
            return media;
        });

        return {
            media: animes,
            mappings,
        };
    }

    private async searchManga(options: { [key: string]: any }): Promise<{
        media: Media[];
        mappings: Mapping[][];
    }> {
        let url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(
            options.query
        )}`;

        if (options.sortBy != null) {
            url += `&order_by=${options.sortBy}&sort=asc`;
        }

        if (!options.adult) {
            url += "&sfw";
        }

        delete options.query;
        delete options.sortBy;
        delete options.adult;

        url += `&${serializeURL(options)}`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get manga");
        }

        let mappings: Mapping[][] = [];
        let mangas: Media[] = res.data.data.map((manga: any) => {
            const { media, mappings: m } =
                this.jikanMangaToInternalValue(manga);

            mappings.push(m);
            return media;
        });

        return {
            media: mangas,
            mappings,
        };
    }

    private async getAnime({
        id,
    }: {
        id: string;
    }): Promise<{ media: Media; mappings: Mapping[] }> {
        let url = `https://api.jikan.moe/v4/anime/${id}/full`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get anime");
        }

        return this.jikanAnimeToInteralValue(res.data.data);
    }

    private async getManga({
        id,
    }: {
        id: string;
    }): Promise<{ media: Media; mappings: Mapping[] }> {
        let url = `https://api.jikan.moe/v4/manga/${id}/full`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get manga");
        }

        return this.jikanMangaToInternalValue(res.data.data);
    }

    private async *getAnimeList(account: ExternalAccount): AsyncGenerator<{
        media: Media[];
        entries: LibraryEntry[];
        mappings: Mapping[][];
    }> {
        let page = 1;

        while (true) {
            let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(
                account.user!.name!
            )}/animelist?sort=list_updated_at&limit=${
                page * 1000
            }&fields=list_status{status,score,num_episodes_watched,is_rewatching,start_date,finish_date,priority,num_times_rewatched,rewatch_value,tags,comments,updated_at},start_date,end_date,nsfw,genres,media_type,num_episodes,rating,average_episode_duration,alternative_titles`;

            const res = await fetch<any>(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${await this.accessToken(account)}`,
                },
            });

            console.log(res.data);

            if (res.ok === false) {
                throw Error("Failed to get anime list");
            }

            let newMedia: Media[] = [];
            let newMappings: Mapping[][] = [];
            let newLibraryEntries: LibraryEntry[] = [];

            for (const entry of res.data.data) {
                let normalized = this.malAnimeToInternalValue(entry.node);
                let libraryEntry = this.libraryEntryToInternalValue(
                    entry.list_status,
                    `myanimelist:anime:${entry.node.id.toString()}`
                );

                newMedia.push(normalized.media);
                newMappings.push(normalized.mappings);
                newLibraryEntries.push(libraryEntry);
            }

            yield {
                media: newMedia,
                mappings: newMappings,
                entries: newLibraryEntries,
            };

            if (!res.data.pagination.next) {
                break;
            }

            page++;
        }
    }

    private async *getMangaList(account: ExternalAccount): AsyncGenerator<{
        media: Media[];
        mappings: Mapping[][];
        entries: LibraryEntry[];
    }> {
        let page = 1;

        while (true) {
            let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(
                account.user!.name!
            )}/mangalist?sort=list_updated_at&limit=${
                page * 1000
            }&fields=list_status{status,score,num_chapters_read,num_volumes_read,is_rereading,start_date,finish_date,priority,num_times_reread,reread_value,tags,comments,updated_at},start_date,end_date,nsfw,genres,media_type,num_chapters,num_volumes,alternative_titles`;

            const res = await fetch<any>(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${await this.accessToken(account)}`,
                },
            });

            if (res.ok === false) {
                throw Error("Failed to get manga list");
            }

            let newMedia: Media[] = [];
            let newMappings: Mapping[][] = [];
            let newLibraryEntries: LibraryEntry[] = [];

            for (const entry of res.data.data) {
                let normalized = this.malMangaToInternalValue(entry.node);
                let libraryEntry = this.libraryEntryToInternalValue(
                    entry.list_status,
                    `myanimelist:manga:${entry.node.id.toString()}`
                );

                newMedia.push(normalized.media);
                newMappings.push(normalized.mappings);
                newLibraryEntries.push(libraryEntry);
            }

            yield {
                media: newMedia,
                mappings: newMappings,
                entries: newLibraryEntries,
            };

            if (!res.data.paging.next) break;

            page++;
        }
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<{ media: Media[]; mappings: Mapping[][] }> {
        let result: { media: Media[]; mappings: Mapping[][] };

        switch (type) {
            case "anime":
                result = await this.searchAnime(options);
                break;

            case "manga":
                result = await this.searchManga(options);
                break;

            default:
                throw Error("Invalid media type");
        }

        return result;
    }

    async getMedia(
        type: MediaType,
        id: string
    ): Promise<{
        media: Media;
        mappings: Mapping[];
    }> {
        switch (type) {
            case "anime":
                return this.getAnime({ id });

            case "manga":
                return this.getManga({ id });

            default:
                throw Error("Invalid media type");
        }
    }

    async *getUserLibrary(type: MediaType, account: ExternalAccount) {
        if (type === "anime") {
            yield* this.getAnimeList(account);
        } else if (type === "manga") {
            yield* this.getMangaList(account);
        } else {
            throw Error("Invalid media type");
        }
    }

    async getUser(account: ExternalAccount): Promise<UserData> {
        const url = `https://api.jikan.moe/v4/users/${encodeURIComponent(
            account.auth!.username!
        )}/full`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get user");
        }

        const data = res.data.data;

        return {
            id: data.mal_id.toString(),
            name: data.username,
            imageUrl: data.images.webp.image_url,
        };
    }

    private async accessToken(account: ExternalAccount): Promise<string> {
        if (!account.auth) throw Error("Account is not logged in");

        if (
            account.auth!.accessTokenExpiresAt!.getTime() < new Date().getTime()
        ) {
            return account.auth.accessToken!;
        }

        const res = await fetch<{
            access_token?: string;
        }>("https://naoka.nyeki.dev/api/auth/oauth2/myanimelist/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: Body.json({
                refresh_token: account.auth!.refreshToken,
            }),
        });

        if (!res.ok) throw Error("Could not refresh token.");
        if (!res.data.access_token) {
            delete account.auth;
            delete account.user;
            await db.externalAccounts.put(account);
            throw Error("Refresh token has expired.");
        }

        account.auth.accessToken = res.data.access_token;
        account.auth.accessTokenExpiresAt = new Date(
            new Date().getTime() + 1000 * 60 * 60
        );

        await db.externalAccounts.put(account);

        return res.data.access_token;
    }

    async authorize(account: ExternalAccount, { code }: { code: string }) {
        const { access_token, refresh_token, expires_in } = JSON.parse(
            decrypt(
                code,
                Buffer.from(
                    sessionStorage.getItem(
                        `Naoka:Provider:${this.name}:OAuthKey`
                    )!,
                    "hex"
                ),
                Buffer.from(
                    sessionStorage.getItem(
                        `Naoka:Provider:${this.name}:OAuthIV`
                    )!,
                    "hex"
                )
            )
        );

        account.auth = {
            accessToken: access_token,
            refreshToken: refresh_token,
            // Expires in an hour
            accessTokenExpiresAt: new Date(
                new Date().getTime() + 1000 * 60 * 60
            ),
            refreshTokenExpiresAt: new Date(new Date().getTime() + expires_in),
        };

        const res = await fetch<any>(
            "https://api.myanimelist.net/v2/users/@me?fields=id,name,picture",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        account.user = {
            id: res.data.id,
            name: res.data.name,
            imageUrl: res.data.picture,
        };

        await db.externalAccounts.update(account.id!, account);
    }
}
