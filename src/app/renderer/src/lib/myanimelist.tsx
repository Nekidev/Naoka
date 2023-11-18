import { BaseAPI, Config, Media } from "@/lib";

export class MyAnimeList extends BaseAPI {
    title: string = "MyAnimeList";
    config: Config = {
        search: {
            anime: {
                filters: [],
            },
            manga: {
                filters: [],
            },
        },
    };

    async search(
        { query }: { query: string },
        type: "anime" | "manga" | "characters" | "people" = "anime"
    ): Promise<[Media[], boolean]> {
        const res = await fetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`
        );

        if (res.ok === false) {
            return [[], true];
        }

        const data = await res.json();
        let animes: Media[] = data.data.map(
            (anime: any) =>
                new Media(
                    anime.mal_id,
                    anime.titles.find(
                        (title: { type: string; title: string }) => {
                            return title.type === "Default";
                        }
                    ).title,
                    anime.synopsis,
                    anime.images.webp.image_url,
                    anime.images.webp.large_image_url,
                    anime.type,
                    anime.source,
                    anime.status,
                    anime.genres.map((genre: any) => genre.name)
                )
        );

        return [animes, false];
    }
}
