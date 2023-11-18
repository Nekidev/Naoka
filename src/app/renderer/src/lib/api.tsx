import { BaseAPI } from ".";

import { MyAnimeList } from "./myanimelist";


export default function getAPI(code: string): BaseAPI {
    return {
        myanimelist: new MyAnimeList(),
    }[code] as BaseAPI;
}
