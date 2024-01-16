import { Data } from "dataclass";
import { ProviderAPI, providers } from "../providers";
import { db } from ".";
import { updateMappings } from "./utils";

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
    Unknown = "unknown"
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
    isAdult?: boolean;
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
    score: number | null;
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

export enum RecommendationLevel {
    NotRecommended = "not_recommended",
    MixedFeelings = "mixed_feelings",
    Recommended = "recommended"
}

export class Review extends Data {
    mapping!: Mapping;
    charactersScore!: number | null;
    illustrationScore!: number | null;
    soundtrackScore!: number | null;
    animationScore!: number | null;
    creativityScore!: number | null;
    voiceScore!: number | null;
    writingScore!: number | null;
    engagementScore!: number | null;
    overallScore!: number | null;
    review!: string;
    summary!: string;
    isSpoiler!: boolean;
    recommendation!: RecommendationLevel;
    isPrivate!: boolean;
    updatedAt!: Date;
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

    // I burnt out my brain working on this function, so I wouldn't be suprised
    // if you cannot understand how tf it works.
    async importLibrary(
        type: MediaType,
        method: ImportMethod = ImportMethod.Keep
    ) {
        const api = new ProviderAPI(this.provider);
        const { entries, mappings: newMappings } = await api.getLibrary(type, this);

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

        const newEntries = entries.map((newEntry: LibraryEntry) => {
            let existingEntry = conflictingEntries.find(
                (e) => e && e.mapping === newEntry.mapping
            );

            if (!!existingEntry) {
                // Keep favorite status
                newEntry.favorite = existingEntry.entry.favorite;

                if (method === ImportMethod.Merge) {
                    let newEntryInstance: { [key: string]: any } = {};

                    Object.getOwnPropertyNames(newEntry).forEach(
                        (value: string) => {
                            if (
                                newEntry.updatedAt >
                                existingEntry!.entry.updatedAt
                            ) {
                                if (!!newEntry[value as keyof LibraryEntry]) {
                                    newEntryInstance[value] =
                                        newEntry[value as keyof LibraryEntry];
                                } else {
                                    newEntryInstance[value] =
                                        existingEntry?.entry[
                                            value as keyof LibraryEntry
                                        ];
                                }
                            } else {
                                if (
                                    !!existingEntry?.entry[
                                        value as keyof LibraryEntry
                                    ]
                                ) {
                                    newEntryInstance[value] =
                                        existingEntry?.entry[
                                            value as keyof LibraryEntry
                                        ];
                                } else {
                                    newEntryInstance[value] =
                                        newEntry[value as keyof LibraryEntry];
                                }
                            }
                        }
                    );

                    newEntryInstance.mapping = existingEntry.entry.mapping;
                    newEntry = newEntryInstance as LibraryEntry;
                } else {
                    if (
                        (method === ImportMethod.Latest &&
                            existingEntry.entry.updatedAt >
                                newEntry.updatedAt) ||
                        method === ImportMethod.Keep
                    ) {
                        return existingEntry.entry;
                    } else {
                        return newEntry;
                    }
                }
            }

            return newEntry;
        });

        return await db.library.bulkPut(newEntries);
    }
}
