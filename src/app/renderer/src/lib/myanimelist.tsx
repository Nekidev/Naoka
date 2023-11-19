import { BaseAPI, Config, Media, SearchType } from "@/lib";
import { serializeURL } from "@/utils";

export class MyAnimeList extends BaseAPI {
    title: string = "MyAnimeList";
    config: Config = {
        search: {
            anime: {
                filters: [
                    {
                        type: "select",
                        value: {
                            name: "type",
                            label: "Show type",
                            values: [
                                {
                                    label: "All",
                                    value: "",
                                },
                                {
                                    label: "TV",
                                    value: "tv",
                                },
                                {
                                    label: "Movie",
                                    value: "movie",
                                },
                                {
                                    label: "OVA",
                                    value: "ova",
                                },
                                {
                                    label: "Special",
                                    value: "special",
                                },
                                {
                                    label: "ONA",
                                    value: "ona",
                                },
                                {
                                    label: "Music",
                                    value: "music",
                                },
                            ],
                        },
                    },
                    {
                        type: "select",
                        value: {
                            name: "rating",
                            label: "Age rating",
                            values: [
                                {
                                    label: "All",
                                    value: "",
                                },
                                {
                                    label: "G - All ages",
                                    value: "g",
                                },
                                {
                                    label: "PG - Children",
                                    value: "pg",
                                },
                                {
                                    label: "PG-13 - Teens 13 or older",
                                    value: "pg13",
                                },
                                {
                                    label: "R - 17+ (violence & profanity)",
                                    value: "r17",
                                },
                                {
                                    label: "R+ - Mild Nudity",
                                    value: "r",
                                },
                                {
                                    label: "Rx - Hentai",
                                    value: "rx",
                                },
                            ],
                        },
                    },
                    {
                        type: "select",
                        value: {
                            name: "status",
                            label: "Status",
                            values: [
                                {
                                    label: "All",
                                    value: "",
                                },
                                {
                                    label: "Upcoming",
                                    value: "upcoming",
                                },
                                {
                                    label: "Airing",
                                    value: "airing",
                                },
                                {
                                    label: "Complete",
                                    value: "complete",
                                },
                            ],
                        },
                    },
                    {
                        type: "checkbox",
                        value: {
                            name: "sfw",
                            label: "Filter NSFW results",
                            defaultValue: true,
                        },
                    },
                ],
            },
            manga: {
                filters: [],
            },
        },
    };

    private async searchAnime(options: {
        [key: string]: any;
    }): Promise<[Media[], boolean]> {
        let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
            options.query
        )}`;
        options.query = undefined;
        url += `&${serializeURL(options)}`;

        const res = await fetch(url);

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
                    anime.genres.map((genre: any) => genre.name),
                    anime.aired.from ? new Date(anime.aired.from) : null,
                    anime.aired.to ? new Date(anime.aired.to) : null,
                    anime.rating,
                    anime.rating.slice(0, 1).toLowerCase() == "r"
                )
        );

        return [animes, false];
    }

    async search(
        options: { [key: string]: any },
        type: SearchType
    ): Promise<[Media[], boolean]> {
        switch (type) {
            case "anime":
                return await this.searchAnime(options);

            default:
                return [[], true];
        }
    }
}
