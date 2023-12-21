import { BaseAPI, Media } from "./providers";
import { APIProvider, MediaType } from "./types";
import { ExternalAccount, UserData, db } from "./db";

import { MyAnimeList } from "./providers/myanimelist";
import { AniList } from "./providers/anilist";

import Dexie from "dexie";

export const providers = {
    myanimelist: new MyAnimeList(),
    anilist: new AniList(),
};

export default class API {
    private api!: BaseAPI;

    get config() {
        return this.api.config;
    }

    get title() {
        return this.api.title;
    }

    constructor(code: APIProvider) {
        const api = providers[code];

        if (!api) {
            throw Error("Invalid API code");
        }

        this.api = api;
    }

    async search(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<[Media[], boolean]> {
        const [results, error] = await this.api.search(type, options);

        db.mediaCache
            .bulkPut(
                results.map((value: Media, index: number) => {
                    return {
                        type: value.type,
                        title: value.title,
                        imageUrl: value.imageUrl,
                        bannerUrl: value.bannerUrl,
                        episodes: value.episodes,
                        chapters: value.chapters,
                        volumes: value.volumes,
                        startDate: value.startDate,
                        finishDate: value.endDate,
                        genres: value.genres,
                        duration: value.duration,
                        isAdult: value.isAdult,
                        mapping: value.mappings[0],
                    };
                })
            )
            .then((lastKey) => {})
            .catch(Dexie.BulkError, (error) => {
                console.error(
                    `Failed to add ${error.failures.length} items to mediaCache. The other results were successfully added.`
                );
            });

        return [results, error];
    }

    getMedia(
        type: MediaType,
        { id }: { id: string }
    ): Promise<[Media | null, boolean]> {
        return this.api.getMedia(type, { id });
    }

    importList(type: MediaType, account: ExternalAccount, override: boolean = false) {
        return this.api.importList(type, account, override);
    }

    getUser(account: ExternalAccount): Promise<UserData> {
        return this.api.getUser(account);
    }
}
