import Dexie, { Table } from "dexie";
import {
    ExternalAccount,
    LibraryEntry,
    List,
    Mappings,
    Media,
    Review,
} from "./types";

export class NaokaDB extends Dexie {
    media!: Table<Media>;
    lists!: Table<List>;
    library!: Table<LibraryEntry>;
    reviews!: Table<Review, number>;
    mappings!: Table<Mappings>;
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
        this.version(2).stores({
            reviews: "++id, mapping",
            library:
                "&mapping, type, favorite, status, updatedAt, *missedSyncs",
            externalAccounts: "++id, provider, *syncing",
        }).upgrade((tx) => {
            tx.table("library").toCollection().modify((entry: LibraryEntry) => {
                entry["missedSyncs"] = [];
                return entry;
            });
        });

        this.externalAccounts.mapToClass(ExternalAccount);
    }
}

export const db = new NaokaDB();
