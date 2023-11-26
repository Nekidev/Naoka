import Dexie, { Table } from "dexie";
import { IntRange } from "@/utils/types";
import { MediaType, Mapping, LibraryStatus, APIProvider } from "./types";

export interface MediaCache {
    type: MediaType;
    title: string;
    imageUrl: string | null;
    bannerUrl: string | null;
    mapping: Mapping;
}

export interface LibraryEntry {
    type: MediaType;
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
}

export interface List {
    id?: number;
    name: string;
    items: Mapping[];
    syncedProviders: APIProvider[];
    updatedAt: Date;
    createdAt: Date;
    accessedAt: Date;
}

export class NaokaDB extends Dexie {
    mediaCache!: Table<MediaCache>;
    library!: Table<LibraryEntry>;
    lists!: Table<List>;

    constructor() {
        super("Naoka");

        this.version(1).stores({
            mediaCache: "&mapping, type",
            library: "&mapping, type, status, score",
            lists: "++id, name",
        });
    }
}

export const db = new NaokaDB();
