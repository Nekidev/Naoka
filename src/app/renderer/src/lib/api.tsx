import { BaseProvider } from "./providers";
import { Provider, MediaType } from "./types";
import { ExternalAccount, Media, UserData } from "./db";

import { MyAnimeList } from "./providers/myanimelist";
import { AniList } from "./providers/anilist";

export const providers = {
    myanimelist: new MyAnimeList(),
    anilist: new AniList(),
};

export default class API {
    private api!: BaseProvider;

    get config() {
        return this.api.config;
    }

    get name() {
        return this.api.name;
    }

    constructor(code: Provider) {
        const api = providers[code];

        if (!api) {
            throw Error("Invalid API code");
        }

        this.api = api;
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<Media[]> {
        // TODO: Update mappings in the mappings DB table and update media in the media DB table
        const { media, mappings } = await this.api.search(type, options);

        return media;
    }

    async getMedia(type: MediaType, id: string): Promise<Media> {
        // TODO: Update mappings in the mappings DB table and media in the media DB table
        const { media, mappings } = await this.api.getMedia(type, id);

        return media;
    }

    async getLibrary(
        type: MediaType,
        account: ExternalAccount
    ) {
        // TODO: Save entries to library and update mappings and media in the DB
        const { media, mappings, entries } = await this.api.getLibrary(
            type,
            account
        );
    }

    async getUser(account: ExternalAccount): Promise<UserData> {
        return this.api.getUser(account);
    }
}
