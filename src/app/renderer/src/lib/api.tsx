import { BaseAPI, Media } from "./providers";
import { MediaType } from "./types";
import { db } from "./db";

import { MyAnimeList } from "./providers/myanimelist";
import Dexie from "dexie";

export function getAPI(code: string): BaseAPI {
    return {
        myanimelist: new MyAnimeList(),
    }[code] as BaseAPI;
}

export default class API {
    private api!: BaseAPI;

    get config() {
        return this.api.config;
    }

    get title() {
        return this.api.title;
    }

    constructor(code: string) {
        const api = getAPI(code);

        if (!api) {
            throw Error("Invalid API code");
        }

        this.api = api;
    }

    async search(
        options: { [key: string]: any },
        type: MediaType
    ): Promise<[Media[], boolean]> {
        const [results, error] = await this.api.search(options, type);

        db.mediaCache
            .bulkPut(
                results.map((value: Media, index: number) => {
                    return {
                        type: value.type,
                        title: value.title,
                        imageUrl: value.imageUrl,
                        bannerUrl: value.bannerUrl,
                        mapping: value.mappings[0],
                    };
                })
            )
            .then((lastKey) => {
                console.log("Added to mediaCache up to:", lastKey);
            })
            .catch(Dexie.BulkError, (error) => {
                console.error(
                    `Failed to add ${error.failures.length} items to mediaCache. The other results were successfully added.`
                );
            });

        return [results, error];
    }

    async getMedia(
        { id }: { id: string },
        type: MediaType
    ): Promise<[Media | null, boolean]> {
        return await this.api.getMedia({ id }, type);
    }
}
