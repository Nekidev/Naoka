import { db } from "../db";
import { BaseProvider } from "./base";
import {
    ExternalAccount,
    LibraryEntry,
    Mapping,
    Media,
    MediaRating,
    MediaType,
    Provider,
    UserData,
} from "../db/types";

import { AniList } from "./anilist";
import { MyAnimeList } from "./myanimelist";

import { updateMappings } from "../db/utils";

// Add new providers here
export const providers = {
    anilist: new AniList(),
    myanimelist: new MyAnimeList(),
};

export class ProviderAPI {
    private api!: BaseProvider;
    code!: Provider;

    get config() {
        return this.api.config;
    }

    get name() {
        return this.api.name;
    }

    constructor(code: Provider) {
        const api: BaseProvider = providers[code as keyof typeof providers];
        this.api = api;
        this.code = code;
    }

    async getSearch(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<Media[]> {
        let adultFilter = JSON.parse(
            localStorage.getItem("Naoka:Settings:AdultFilter") ?? "true"
        );
        let { media, mappings } = await this.api.getSearch(type, {
            ...options,
            adult: !adultFilter,
        });

        (async () => {
            await db.media.bulkPut(media);
            for (const ms of mappings) {
                await updateMappings(ms);
            }
        })().then(() => {});

        if (adultFilter) {
            // No adult content allowed
            media = media.filter(
                (m: Media) =>
                    !m.isAdult &&
                    ![MediaRating.RPlus, MediaRating.Rx].includes(m.rating!)
            );
        }

        return media;
    }

    async getMedia(type: MediaType, id: string): Promise<Media> {
        const { media, mappings } = await this.api.getMedia(type, id);

        (async () => {
            await db.media.put(media);
            await updateMappings(mappings);
        })().then(() => {});

        return media;
    }

    async *getUserLibrary(type: MediaType, account: ExternalAccount) {
        for await (const {
            media,
            mappings,
            entries,
        } of this.api.getUserLibrary(type, account)) {
            (async () => {
                await db.media.bulkPut(media);
                for (const ms of mappings) {
                    await updateMappings(ms);
                }
            })();

            yield { media, mappings, entries };
        }
    }

    async getLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.getLibraryEntry(account, entry, mappings);
    }

    async updateLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.updateLibraryEntry(account, entry, mappings);
    }

    async deleteLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.deleteLibraryEntry(account, entry, mappings);
    }

    async getUser(account: ExternalAccount): Promise<UserData> {
        return this.api.getUser(account);
    }

    async authorize(account: ExternalAccount, props: { [key: string]: any }) {
        return this.api.authorize(account, props);
    }
}
