import { BaseAPI, Config, Anime } from "@/lib";

function MagnifyingGlassIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
        </svg>
    );
}

export class MyAnimeList extends BaseAPI {
    title: string = "MyAnimeList";
    config: Config = {
        search: {
            anime: {
                filters: [
                    {
                        type: "text",
                        value: {
                            name: "query",
                            label: "Search",
                            icon: (
                                <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />
                            ),
                        },
                    },
                ],
            },
            manga: {
                filters: [
                    {
                        type: "text",
                        value: {
                            name: "query",
                            label: "Search",
                            icon: (
                                <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />
                            ),
                        },
                    },
                ],
            },
        },
    };

    async search(
        { query }: { query: string },
        type: "anime" = "anime"
    ): Promise<[Anime[], boolean]> {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);

        if (!res.ok) {
            return [[], false];
        }

        const data = await res.json();
        let animes: Anime[] = data.data.map(
            (anime: any) =>
                new Anime(
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
                    anime.status
                )
        );

        return [animes, true];
    }
}
