import { Data } from "dataclass";
import Dexie, { Table } from "dexie";
import { MediaType, Mapping, LibraryStatus, Provider } from "../types";

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

interface Mappings {
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
    syncedProviders: Provider[];
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
}

export class NaokaDB extends Dexie {
    media!: Table<Media>;
    mappings!: Table<Mappings>;
    library!: Table<LibraryEntry>;
    lists!: Table<List>;
    externalAccounts!: Table<ExternalAccount, number>;

    constructor() {
        super("Naoka");

        this.version(1).stores({
            media: "&mapping, type",
            mappings: "++id, *mappings",
            library: "&mapping, type, favorite, status, score",
            lists: "++id, name",
            externalAccounts: "++id, provider",
        });

        this.externalAccounts.mapToClass(ExternalAccount);
    }
}

export const db = new NaokaDB();
