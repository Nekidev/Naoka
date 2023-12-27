import { BaseProvider } from "./base";

import { AniList } from "./anilist";
import { MyAnimeList } from "./myanimelist";
import { MediaType, Provider } from "../types";
import { ExternalAccount, Media, UserData, db } from "../db";
import { updateMappings } from "../db/utils";

// Add new providers here
export const providers = {
    anilist: new AniList(),
    myanimelist: new MyAnimeList(),
}

export class ProviderAPI {
    private api!: BaseProvider;

    get config() {
        return this.api.config;
    }

    get name() {
        return this.api.name;
    }

    constructor(code: Provider) {
        const api: BaseProvider = providers[code as keyof typeof providers];
        this.api = api;
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<Media[]> {
        // TODO: Update mappings in the mappings DB table and update media in the media DB table
        const { media, mappings } = await this.api.search(type, options);

        (async () => {
            await db.media.bulkPut(media);
            for (const ms of mappings) {
                await updateMappings(ms)
            }
        })().then(() => {});

        return media;
    }

    async getMedia(type: MediaType, id: string): Promise<Media> {
        // TODO: Update mappings in the mappings DB table and media in the media DB table
        const { media, mappings } = await this.api.getMedia(type, id);

        (async () => {
            await db.media.put(media);
            await updateMappings(mappings);
        })().then(() => {});

        return media;
    }

    async getLibrary(type: MediaType, account: ExternalAccount) {
        // TODO: Save entries to library and update mappings and media in the DB
        const { media, mappings, entries } = await this.api.getLibrary(
            type,
            account
        );

        (async () => {
            await db.media.bulkPut(media);
            for (const ms of mappings) {
                await updateMappings(ms)
            }
        })().then(() => {});

        return {
            media,
            entries,
            mappings,
        };
    }

    async getUser(account: ExternalAccount): Promise<UserData> {
        return this.api.getUser(account);
    }
}
