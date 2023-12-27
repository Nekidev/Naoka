import Dexie, { Table } from "dexie";
import { ExternalAccount, LibraryEntry, List, Mappings, Media } from "./types";

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
