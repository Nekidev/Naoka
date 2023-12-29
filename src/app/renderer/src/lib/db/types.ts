import { Data } from "dataclass";
import { ProviderAPI, providers } from "../providers";
import { db } from ".";

export type MediaType = "anime" | "manga";

export type Provider = keyof typeof providers;

export enum LibraryStatus {
    NotStarted = "not_started",
    Planned = "planned",
    InProgress = "in_progress",
    Paused = "paused",
    Dropped = "dropped",
    Completed = "completed",
}

export enum MediaGenre {
    Action = "action",
    Adventure = "adventure",
    AvantGarde = "avant_garde",
    AwardWinning = "award_winning",
    Comedy = "comedy",
    Drama = "drama",
    Ecchi = "ecchi",
    Erotica = "erotica",
    Fantasy = "fantasy",
    Gourmet = "gourmet",
    Hentai = "hentai",
    Horror = "horror",
    MahouShoujo = "mahou_shoujo",
    Mecha = "mecha",
    Music = "music",
    Mistery = "mistery",
    Psychological = "psychological",
    Romance = "romance",
    SciFi = "sci_fi",
    SliceOfLife = "slice_of_life",
    Sports = "sports",
    Supernatural = "supernatural",
    Suspense = "suspense",
    Thriller = "thriller",
    Yaoi = "yaoi",
    Yuri = "yuri",
}

export enum MediaFormat {
    Tv = "tv",
    TvShort = "tv_short",
    Movie = "movie",
    Special = "special",
    Ova = "ova",
    Ona = "ona",
    Music = "music",
    Manga = "manga",
    Novel = "novel",
    LightNovel = "light_novel",
    OneShot = "one_shot",
    Doujinshi = "doujinshi",
    Manhwa = "manhwa",
    Manhua = "manhua",
    Oel = "oel",
}

export enum MediaStatus {
    NotStarted = "not_started",
    InProgress = "in_progress",
    Hiatus = "hiatus",
    Cancelled = "cancelled",
    Finished = "finished",
}

export enum MediaRating {
    G = "g",
    PG = "pg",
    PG13 = "pg_13",
    R = "r",
    RPlus = "r_plus",
    Rx = "rx",
}

export interface Media {
    type: MediaType;
    title: {
        romaji: string | null;
        english: string | null;
        native: string | null;
    };
    imageUrl: string | null;
    bannerUrl: string | null;
    episodes?: number | null;
    chapters?: number | null;
    volumes?: number | null;
    startDate: Date | null;
    finishDate: Date | null;
    genres: MediaGenre[];
    format: MediaFormat | null;
    status: MediaStatus | null;
    rating?: MediaRating | null;
    duration?: number | null;
    mapping: Mapping;
}

// Provider:MediaType:ID
export type Mapping = `${Provider}:${MediaType}:${string}`;

export interface Mappings {
    id?: number;
    mappings: Mapping[];
}

export interface LibraryEntry {
    type: MediaType;
    favorite: boolean;
    status: LibraryStatus;
    score: number;
    episodeProgress?: number;
    chapterProgress?: number;
    volumeProgress?: number;
    restarts: number;
    startDate: Date | null;
    finishDate: Date | null;
    notes: string;
    mapping: Mapping;
    updatedAt: Date;
}

export interface List {
    id?: number;
    name: string;
    items: Mapping[];
}

export enum ImportMethod {
    // Keep the current library entry
    Keep = "keep",

    // Keep the new library entry
    Overwrite = "overwrite",

    // Keep the lastest library entry
    Latest = "latest",
}

export interface UserData {
    id: string;
    name: string;
    imageUrl: string;
}

export class ExternalAccount extends Data {
    id?: number;
    provider: Provider = "myanimelist";
    auth?: {
        accessToken?: string;
        refreshToken?: string;
        username?: string;
        password?: string;
    };
    user?: UserData;

    async getLibrary(type: MediaType) {
        const api = new ProviderAPI(this.provider);
        return api.getLibrary(type, this);
    }

    async getData() {
        const api = new ProviderAPI(this.provider);
        return api.getUser(this);
    }

    async importLibrary(
        type: MediaType,
        method: ImportMethod = ImportMethod.Keep
    ) {
        const api = new ProviderAPI(this.provider);
        const { entries } = await api.getLibrary(type, this);

        switch (method) {
            case ImportMethod.Keep:
                return await db.library.bulkAdd(entries);

            case ImportMethod.Overwrite:
                await db.library.bulkAdd(entries);
                return await db.library.bulkPut(entries);

            case ImportMethod.Latest:
                const existingEntries = await db.library.bulkGet(
                    entries.map((e) => e.mapping)
                );
                const newEntries = entries.map((newEntry: LibraryEntry) => {
                    const existingEntry = existingEntries.find(
                        (e: LibraryEntry | undefined) =>
                            !!e && e.mapping === newEntry.mapping
                    );

                    if (!!existingEntry) {
                        if (existingEntry.updatedAt > newEntry.updatedAt) {
                            return existingEntry;
                        } else {
                            return newEntry;
                        }
                    }

                    return newEntry;
                });

                return await db.library.bulkPut(newEntries);
        }
    }
}
