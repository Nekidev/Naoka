import { Data } from "dataclass";
import Dexie, { Table } from "dexie";
import { IntRange } from "@/utils/types";
import { MediaType, Mapping, LibraryStatus, APIProvider } from "../types";

export interface MediaCache {
    type: MediaType;
    title: string;
    imageUrl: string | null;
    bannerUrl: string | null;
    episodes: number | null;
    chapters: number | null;
    volumes: number | null;
    startDate: Date | null;
    finishDate: Date | null;
    isAdult: boolean | null;
    genres: string[] | null;
    duration: number | null;
    mapping: Mapping;
}

export interface LibraryEntry {
    type: MediaType;
    favorite: boolean;
    status: LibraryStatus;
    score: IntRange<1, 100>;
    episodeProgress?: number;
    chapterProgress?: number;
    volumeProgress?: number;
    restarts: number;
    startDate: Date | null;
    finishDate: Date | null;
    notes: string;
    mapping: Mapping;
    media?: MediaCache;
}

export interface List {
    id?: number;
    name: string;
    items: Mapping[];
    itemCaches?: MediaCache[];
    syncedProviders: APIProvider[];
    updatedAt: Date;
    createdAt: Date;
    accessedAt: Date;
}

export class ExternalAccount extends Data {
    id?: number;
    provider: APIProvider = "myanimelist";
    username: string = "Anonymous";
    imageUrl: string | null = null;
    auth: {
        accessToken?: string;
        refreshToken?: string;
        password?: string;
    } = {};
}

export class NaokaDB extends Dexie {
    mediaCache!: Table<MediaCache>;
    library!: Table<LibraryEntry>;
    lists!: Table<List>;
    externalAccounts!: Table<ExternalAccount, number>;

    constructor() {
        super("Naoka");

        this.version(1).stores({
            mediaCache: "&mapping, type",
            library: "&mapping, type, favorite, status, score",
            lists: "++id, name",
            externalAccounts: "++id, provider",
        });

        this.externalAccounts.mapToClass(ExternalAccount);
    }
}

export const db = new NaokaDB();
