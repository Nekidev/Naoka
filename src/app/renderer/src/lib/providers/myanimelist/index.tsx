import { BaseProvider, Config } from "@/lib/providers";
import { LibraryStatus, Mapping, MediaType } from "../../types";
import { serializeURL } from "@/utils";
import {
    ExternalAccount,
    MediaGenre,
    LibraryEntry,
    Media,
    MediaStatus,
    UserData,
    db,
    MediaFormat,
    MediaRating,
} from "../../db";
import { fetch } from "@tauri-apps/api/http";
import config from "./config";

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
    // TODO: Add missing genres to the enum and map them
    return {
        action: MediaGenre.Action,
        adventure: MediaGenre.Adventure,
        "boys love": MediaGenre.Yaoi,
        comedy: MediaGenre.Comedy,
        drama: MediaGenre.Drama,
        fantasy: MediaGenre.Fantasy,
        "girls love": MediaGenre.Yuri,
        horror: MediaGenre.Horror,
        mistery: MediaGenre.Mistery,
        romance: MediaGenre.Romance,
        "sci-fi": MediaGenre.SciFi,
        "slice of life": MediaGenre.SliceOfLife,
        supernatural: MediaGenre.Supernatural,
        suspense: MediaGenre.Suspense,
    }[genre.toLowerCase()];
}

function normalizeLibraryStatus(status: string): LibraryStatus {
    switch (status) {
        case "reading":
        case "watching":
            return "in_progress";

        case "completed":
            return "completed";

        case "on_hold":
            return "paused";

        case "dropped":
            return "dropped";

        case "plan_to_read":
        case "plan_to_watch":
            return "planned";

        default:
            return "not_started";
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
    }[format.toLowerCase()];
}

function normalizeRating(rating: string): MediaRating | undefined {
    return {
        g: MediaRating.G,
        pg: MediaRating.PG,
        "pg-13": MediaRating.PG13,
        r: MediaRating.R,
        "r+": MediaRating.RPlus,
        rx: MediaRating.Rx,
    }[rating.toLowerCase().split("-")[0]];
}

export class MyAnimeList extends BaseProvider {
    name: string = "MyAnimeList";
    config: Config = config;

    private clientID = "bd5f6c8d2ebafac1378531805137ada3";

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
                    ),
                    english: anime.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "English"
                    ),
                    native: anime.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Japanese"
                    ),
                },
                imageUrl: anime.images.webp.large_image_url,
                bannerUrl: null,
                episodes: anime.episodes,
                startDate: anime.airing.from
                    ? new Date(anime.airing.from)
                    : null,
                finishDate: anime.airing.to ? new Date(anime.airing.to) : null,
                genres: anime.genres
                    .map((value: { name: string }) =>
                        normalizeGenre(value.name)
                    )
                    .filter((genre: string | undefined) => !!genre),
                status: normalizeJikanStatus(anime.status) || null,
                format: normalizeFormat(anime.type) || MediaFormat.Tv,
                duration: anime.duration ? normalizeTime(anime.duration) : null,
                rating: normalizeRating(anime.rating) || null,
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
                title: anime.title,
                imageUrl: anime.main_picture?.large,
                bannerUrl: null,
                episodes: anime.num_episodes,
                startDate: anime.start_date ? new Date(anime.start_date) : null,
                finishDate: anime.end_date ? new Date(anime.end_date) : null,
                genres: anime.genres.map((genre: any) => genre.name),
                status: normalizeMalStatus(anime.status) || null,
                format: normalizeFormat(anime.type) || null,
                duration: Math.round(anime.average_episode_duration / 60),
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
                    ),
                    english: manga.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "English"
                    ),
                    native: manga.titles.find(
                        (value: { type: string; title: string }) =>
                            value.type === "Japanese"
                    ),
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
                format: normalizeFormat(manga.type) || MediaFormat.Tv,
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
                chapters: manga.chapters,
                volumes: manga.volumes,
                startDate: manga.start_date ? new Date(manga.start_date) : null,
                finishDate: manga.end_date ? new Date(manga.end_date) : null,
                genres: manga.genres.map((genre: any) => genre.name),
                status: normalizeMalStatus(manga.status) || null,
                format: normalizeFormat(manga.type) || null,
                mapping: `myanimelist:manga:${manga.id.toString()}`,
            },
            mappings: [`myanimelist:manga:${manga.id.toString()}`],
        };
    }

    private libraryEntryToInternalValue(
        entry: any,
        mapping: Mapping
    ): LibraryEntry {
        return {
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
            updatedAt: new Date(entry.updated_at),
            mapping,
        };
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

        delete options.query;
        delete options.sortBy;

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

    private async searchManga(options: {
        [key: string]: any;
    }): Promise<{
        media: Media[];
        mappings: Mapping[][];
    }> {
        let url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(
            options.query
        )}`;

        if (options.sortBy != null) {
            url += `&order_by=${options.sortBy}&sort=asc`;
        }

        delete options.query;
        delete options.sortBy;

        url += `&${serializeURL(options)}`;

        const res = await fetch<any>(url);

        if (res.ok === false) {
            throw Error("Failed to get manga");
        }

        let mappings: Mapping[][] = [];
        let mangas: Media[] = res.data.data.map((manga: any) => {
            const { media, mappings: m } = this.jikanMangaToInternalValue(manga);

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

    private async getAnimeList(account: ExternalAccount): Promise<{
        media: Media[];
        entries: LibraryEntry[];
        mappings: Mapping[][];
    }> {
        if (!account.auth?.username) {
            throw Error("No username provided");
        }

        let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(
            account.auth!.username!
        )}/animelist?limit=1000&fields=list_status{status,score,num_episodes_watched,is_rewatching,start_date,finish_date,priority,num_times_rewatched,rewatch_value,tags,comments,updated_at},start_date,end_date,nsfw,genres,media_type,num_episodes,rating,average_episode_duration`;

        const res = await fetch<any>(url, {
            method: "GET",
            headers: {
                "X-Mal-Client-ID": this.clientID,
            },
        });

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

        return {
            media: newMedia,
            mappings: newMappings,
            entries: newLibraryEntries
        }
    }

    private async getMangaList(
        account: ExternalAccount
    ): Promise<{
        media: Media[];
        mappings: Mapping[][];
        entries: LibraryEntry[];
    }> {
        let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(
            account.auth!.username!
        )}/mangalist?limit=1000&fields=list_status{status,score,num_chapters_read,num_volumes_read,is_rereading,start_date,finish_date,priority,num_times_reread,reread_value,tags,comments,updated_at},start_date,end_date,nsfw,genres,media_type,num_chapters,num_volumes`;

        const res = await fetch<any>(url, {
            method: "GET",
            headers: {
                "X-Mal-Client-ID": this.clientID,
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

        return {
            media: newMedia,
            mappings: newMappings,
            entries: newLibraryEntries
        };
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

    async getLibrary(
        type: MediaType,
        account: ExternalAccount
    ) {
        switch (type) {
            case "anime":
                return this.getAnimeList(account);

            case "manga":
                return this.getMangaList(account);

            default:
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
}
