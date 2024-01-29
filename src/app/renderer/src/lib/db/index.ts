/**
 * Database definition.
 */

import Dexie, { Table } from "dexie";
import {
    ExternalAccount,
    LibraryEntry,
    List,
    Mappings,
    Media,
    Review,
} from "./types";

/**
 * The app's internal database (indexedDB + Dexie.js).
 */
export class NaokaDB extends Dexie {
    /**
     * Don't export this, it's automatically generated. This caches each
     * media's information. It's automatically updated when the media is
     * retrieved from a provider API so that the cache is kind-of up-to-date.
     * 
     * Maybe a background job could be created to update the cache periodically.
     */
    media!: Table<Media>;

    /**
     * The user's list. This may be exported (in fact, users should have an
     * option to export/sync them). Lists may contain different types of media
     * at the same time.
     */
    lists!: Table<List>;

    /**
     * The user's library. This can (and probably will) be exported. It
     * contains all the user's library entries.
     */
    library!: Table<LibraryEntry>;

    // The user's reviews. This may be exported if the user wants to.
    reviews!: Table<Review, number>;

    /**
     * Locally-created mappings. This table is used to link the same media in
     * different providers. Each row is specific to one single media
     * independently of where it's information was taken from.
     * 
     * The `mappings` column (not the table, but the column in the table)
     * contains a list of all mappings belonging to the same media. For example,
     * AoButa will have one entry containing:
     * - anime:anilist:101291
     * - anime:myanimelist:37450
     * 
     * That way, the same media is linked and can be deduplicated everywhere
     * (e.g. library and lists). This table is used to syncronize lists between
     * different providers, and to show the selected provider's version of the
     * media details.
     */
    mappings!: Table<Mappings>;

    /**
     * The user's external accounts. This MUST NOT be exported, since it contains 
     * sensitive information that if leaked can be used to compromise the user's
     * account.
     */
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
        this.version(2)
            .stores({
                reviews: "++id, mapping",
                library:
                    "&mapping, type, favorite, status, updatedAt, *missedSyncs",
                externalAccounts: "++id, provider, *syncing",
            })

        this.externalAccounts.mapToClass(ExternalAccount);
        this.library.mapToClass(LibraryEntry);
    }
}

export const db = new NaokaDB();
