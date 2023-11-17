import { MyAnimeList } from "./mal";


export default function getAPI(code: string) {
    return {
        mal: new MyAnimeList(),
    }[code];
}
