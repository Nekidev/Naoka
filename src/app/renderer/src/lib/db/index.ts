import Dexie, { Table } from "dexie";
import { ExternalAccount, LibraryEntry, List, Mappings, Media, Review } from "./types";

export class NaokaDB extends Dexie {
    media!: Table<Media>;
    lists!: Table<List>;
    library!: Table<LibraryEntry>;
    reviews!: Table<Review>;
    mappings!: Table<Mappings>;
    externalAccounts!: Table<ExternalAccount>;

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
            reviews: "++id, mapping"
        });
        
        this.externalAccounts.mapToClass(ExternalAccount);
        this.reviews.mapToClass(Review);
    }
}

export const db = new NaokaDB();
