import { ProviderAPI, providers } from "../providers";
import { db } from ".";
import { updateMappings } from "./utils";
import { Dataclass } from "../dataclass";

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

// TODO: Add missing MyAnimeList secondary genres/tags
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
    Unknown = "unknown",
}

/**
 * TODO: Add an extra `Auto` status to calculate this based on the `startDate`
 * and `finishDate` of the media, supposing that the media hasn't had any
 * interruptions (case in which the other fixed statuses will be used). This is
 * to be able to dynamically update the status of the media without having to
 * re-query the API of the provider.
 */
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
    // The type of the media
    type: MediaType;

    // Title in different formats
    title: {
        romaji: string | null;
        english: string | null;
        native: string | null;
    };

    // Cover image URL. Should be the largest version available
    imageUrl: string | null;

    // Banner image URL. Should be the largest version available
    bannerUrl: string | null;

    // The amount of episodes, chapters, and volumes the media has
    episodes?: number | null;
    chapters?: number | null;
    volumes?: number | null;

    // The start and finish dates of the media's release
    startDate: Date | null;
    finishDate: Date | null;

    genres: MediaGenre[];
    format: MediaFormat | null;

    // The status of the media
    status: MediaStatus | null;

    // Age rating
    rating?: MediaRating | null;

    /**
     * Is adult only? If this is undefined, the age rating will be used to
     * determine it
     */
    isAdult?: boolean;

    // Duration in minutes of each episode
    duration?: number | null;

    /**
     * Mapping to the media in the provider it's information was taken from.
     * There may be multiple versions of the same media under different
     * mappings, but each mapping must be unique.
     */
    mapping: Mapping;
}

// Provider:MediaType:ID
export type Mapping = `${Provider}:${MediaType}:${string}`;

export interface Mappings {
    id?: number;

    // A list of mappings that point to the same media in different providers
    mappings: Mapping[];
}

export class LibraryEntry extends Dataclass {
    // The type of the media
    type!: MediaType;

    // Is it favorited?
    isFavorite: boolean = false;

    // The status of the library entry
    status: LibraryStatus = LibraryStatus.NotStarted;

    // 0-100. Other rating formats need to be normalized to this range
    score: number | null = null;

    // The progress of the media
    episodeProgress?: number;
    chapterProgress?: number;
    volumeProgress?: number;

    /**
     * Number of times the media has been rewatched, without counting the
     * initial watch
     */
    restarts: number = 0;

    // Dates when the user started and finished watching the series
    startDate: Date | null = null;
    finishDate: Date | null = null;

    // Personal private (?) notes about the series. Not a review
    notes: string = "";

    // Should this entry be hidden from the public?
    isPrivate: boolean = false;

    /**
     * Mapping to the media entry. It'll be queried to the `mappings` table to
     * return the media corresponding to the selected provider, or a default (?)
     * random one if it's not found
     */
    mapping!: Mapping;

    // Last time this entry was updated
    updatedAt!: Date;

    /**
     * Accounts that are synced with this library entry. Once an account ID is
     * added to this list, the app will assume that it has the updated data,
     * and if the provider says the entry could not be found, it'll be
     * considered as deleted and will be removed from every other site the
     * entry is synced with.
     */
    syncedAccountIds: number[] = [];

    /**
     * If an update to this entry was missed (because of an error, e.g. no
     * network connection), a missed sync will be added here and will be
     * retried later.
     */
    missedSyncs: {
        // The account ID of the account that missed the sync
        accountId: number;

        // The type of missed sync
        type: "update" | "removal";

        // The date and time the missed sync happened
        time: Date;
    }[] = [];

    /**
     * Syncronizes the entry with external libraries.
     */
    async sync() {
        const accounts = await db.externalAccounts
            .filter((acc: ExternalAccount) => acc.syncing.includes(this.type))
            .toArray();

        if (!accounts) return;

        const mappings = (await db.mappings
            .where("mappings")
            .equals(this.mapping)
            .first())!.mappings;

        for (const account of accounts) {
            const api = new ProviderAPI(account.provider);

            try {
                await api.updateLibraryEntry(account, this, mappings);
            } catch (e) {
                this.missedSyncs.push({
                    accountId: account.id!,
                    type: "update",
                    time: new Date(),
                });
            }
        }

        await db.library.put(this);
    }

    /**
     * Merges another entry with the current one, keeping the last updated
     * one's values and filling the empty values with the properties of the
     * other entry.
     *
     * @param entry The entry to merge the current entry with
     * @returns {LibraryEntry} The merged entry
     */
    merge(entry: LibraryEntry): LibraryEntry {
        let newEntryInstance: { [key: string]: any } = {};

        Object.getOwnPropertyNames(entry).forEach((value: string) => {
            if (entry.updatedAt.getTime() > this.updatedAt.getTime()) {
                if (!!entry[value as keyof LibraryEntry]) {
                    newEntryInstance[value] =
                        entry[value as keyof LibraryEntry];
                } else {
                    newEntryInstance[value] = this[value as keyof LibraryEntry];
                }
            } else {
                if (!!this[value as keyof LibraryEntry]) {
                    newEntryInstance[value] = this[value as keyof LibraryEntry];
                } else {
                    newEntryInstance[value] =
                        entry[value as keyof LibraryEntry];
                }
            }
        });

        newEntryInstance.mapping = this.mapping;
        newEntryInstance.favorite = this.isFavorite || entry.isFavorite;

        return newEntryInstance as LibraryEntry;
    }
}

/**
 * A media list (those you can see in the sidebar).
 */
export interface List {
    id?: number;
    name: string;
    items: Mapping[];
}

/**
 * MyAnimeList's review recommendation level. MAL requires it in every review
 * so support for it had to be added.
 */
export enum RecommendationLevel {
    NotRecommended = "not_recommended",
    MixedFeelings = "mixed_feelings",
    Recommended = "recommended",
}

/**
 * A media review.
 */
export interface Review {
    id?: number;

    // Mapping to the media entry. It'll be queried using the `mappings` table
    // to return the media corresponding to the selected provider
    mapping: Mapping;

    // Accounts (IDs) used to publish the review. Users may publish reviews
    // from multiple accounts if they want.
    accountIds: number[];

    // Whether it has been already published or not. This is used to choose
    // the publish button's label (publish review/update review)
    isPublished: boolean;

    // Individual scores for each of the review's categories. They must be
    // normalized to the 1-100 range.
    charactersScore: number | null;
    illustrationScore: number | null;
    soundtrackScore: number | null;
    animationScore: number | null;
    creativityScore: number | null;
    voiceScore: number | null;
    writingScore: number | null;
    engagementScore: number | null;

    // Overall critical score of the review. By default it can be an average of
    // all other individual scores, but the user may change it as they wish.
    overallScore: number | null;

    // The review's long content
    body: string;

    // A summary of the review. This may be used when Kitsu is added to publish
    // "reactions".
    summary: string;

    // Whether the review contains spoilers or not. || spoilers aren't
    // currently supported in the markdown editor (though they should be in a
    // future version).
    isSpoiler: boolean;

    // The MAL recommendation level
    recommendation: RecommendationLevel | null;

    // Should the review be visible only to the owner of the review?
    isPrivate: boolean;

    // Last time the review was updated
    updatedAt: Date;
}

export enum ImportMethod {
    // Keep the current library entry
    Keep = "keep",

    // Keep the new library entry
    Overwrite = "overwrite",

    // Keep the lastest library entry
    Latest = "latest",

    // Merge both library entries, preferring the data of the latest updated entry
    Merge = "merge",
}

export interface UserData {
    // ID in the provider. i.e. MAL's user ID, AniList's user ID, etc.
    id: string;

    // Username
    name: string;

    // The largest version available of the user's avatar
    imageUrl: string;
}

// An external account (MAL account, AniList account, etc.)
export class ExternalAccount extends Dataclass {
    // Local ID, NOT external ID
    id?: number;
    provider: Provider = "myanimelist";

    // The account's authorization credentials.
    auth?: {
        accessToken?: string;
        accessTokenExpiresAt?: Date;
        refreshToken?: string;
        refreshTokenExpiresAt?: Date;
        username?: string;
        password?: string;
    };

    // The account's profiled data from the provider
    user?: UserData;

    // Which media libraries should be synced?
    syncing: MediaType[] = [];

    getUserLibrary(type: MediaType) {
        const api = new ProviderAPI(this.provider);
        return api.getUserLibrary(type, this);
    }

    getData() {
        const api = new ProviderAPI(this.provider);
        return api.getUser(this);
    }

    authorize(props: { [key: string]: any }) {
        const api = new ProviderAPI(this.provider);
        return api.authorize(this, props);
    }

    get isAuthed(): boolean {
        const api = new ProviderAPI(this.provider);

        switch (api.config.syncing?.authType) {
            case "username":
                return !!this.auth?.username;

            case "oauth":
                /**
                 * If it has a token with no expiry date, it's still authorized.
                 * Otherwise, check if the token has expired. The access token
                 * may be expired but the auth is still valid if the refresh
                 * token has not.
                 */
                if (this.auth?.refreshToken) {
                    if (this.auth?.refreshTokenExpiresAt) {
                        if (
                            new Date().getTime() <
                            this.auth.refreshTokenExpiresAt!.getTime()
                        )
                            return true;
                    } else return true;
                } else if (this.auth?.accessToken) {
                    if (this.auth?.accessTokenExpiresAt) {
                        if (
                            new Date().getTime() <
                            this.auth.accessTokenExpiresAt!.getTime()
                        )
                            return true;
                    } else return true;
                }

                return false;

            case "basic":
                return !!this.auth?.username && !!this.auth?.password;
        }

        return false;
    }

    // I burnt out my brain working on this function, so I wouldn't be suprised
    // if you cannot understand how tf it works.
    async importLibrary(
        // What media library to import
        type: MediaType,

        // What to do with the imported library
        method: ImportMethod = ImportMethod.Keep,

        // If true, all entries will be imported. Otherwise, the import will
        // only include the entries updated after the last local update.
        all: boolean = true
    ) {
        const api = new ProviderAPI(this.provider);
        let newEntries: LibraryEntry[] = [];
        let lastEntry = await db.library.orderBy("updatedAt").last();

        for await (const {
            entries,
            mappings: newMappings,
        } of api.getUserLibrary(type, this)) {
            for (const mappings of newMappings) {
                await updateMappings(mappings);
            }

            const mappings = await db.mappings
                .where("mappings")
                .anyOf(entries.map((e) => e.mapping))
                .toArray();

            let conflictingEntries: {
                entry: LibraryEntry;
                mapping: Mapping;
            }[] = [];

            // Loop through the imported entries to see if any of them already exists
            await Promise.all(
                entries.map(async (e: LibraryEntry) => {
                    // Find the Mappings object that matches the imported entry's mapping
                    // for the current account's provider.
                    const linkedMappings = mappings.find(
                        // Find the Mappings object that contains the
                        // mapping of the imported entry
                        (m: Mappings) =>
                            !!m.mappings.find(
                                (mapping: Mapping) => mapping === e.mapping
                            )
                    )?.mappings;

                    // No existing Mappings object for the entry's mapping. This means that it's also
                    // not in library so it's safe to add it.
                    if (linkedMappings === undefined) {
                        return;
                    }

                    const entry = await db.library
                        .where("mapping")
                        .anyOf(linkedMappings)
                        .first();

                    if (!entry) return;

                    // Find the mapping of the library entry that matches the imported entry and
                    // replace it's mapping with the new one.
                    conflictingEntries.push({ entry, mapping: e.mapping }); // Local mapping
                })
            );

            newEntries = newEntries.concat(
                entries.map((newEntry: LibraryEntry) => {
                    let existingEntry = conflictingEntries.find(
                        (e) => e && e.mapping === newEntry.mapping
                    );

                    if (!!existingEntry) {
                        // Keep favorite status
                        newEntry.isFavorite = existingEntry.entry.isFavorite;

                        if (method === ImportMethod.Merge) {
                            let newEntryInstance =
                                existingEntry.entry.merge(newEntry);

                            newEntryInstance.mapping =
                                existingEntry.entry.mapping;
                            newEntry = newEntryInstance as LibraryEntry;
                        } else {
                            if (
                                (method === ImportMethod.Latest &&
                                    existingEntry.entry.updatedAt.getTime() >
                                        newEntry.updatedAt.getTime()) ||
                                method === ImportMethod.Keep
                            ) {
                                return existingEntry.entry;
                            } else {
                                return newEntry;
                            }
                        }
                    }

                    return newEntry;
                })
            );

            if (!all && api.config.syncing?.dateSorted) {
                for (const entry of newEntries) {
                    if (
                        lastEntry &&
                        entry.updatedAt.getTime() <
                            lastEntry.updatedAt.getTime()
                    ) {
                        return await db.library.bulkPut(newEntries);
                    }
                }
            }
        }

        return await db.library.bulkPut(newEntries);
    }
}
