import { BaseAPI, Config, Media } from "@/lib/providers";
import { MediaType } from "../types";
import { serializeURL } from "@/utils";

export class MyAnimeList extends BaseAPI {
    title: string = "MyAnimeList";
    config: Config = {
        search: {
            anime: {
                sortBy: [
                    {
                        label: "Relevance",
                        value: "",
                    },
                    {
                        label: "Popularity",
                        value: "popularity",
                    },
                    {
                        label: "Rank",
                        value: "rank",
                    },
                    {
                        label: "Rating",
                        value: "score",
                    },
                    {
                        label: "Title",
                        value: "title",
                    },
                    {
                        label: "Episodes",
                        value: "episodes",
                    },
                    {
                        label: "Start date",
                        value: "start_date",
                    },
                    {
                        label: "End date",
                        value: "end_date",
                    },
                ],
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
                sortBy: [
                    {
                        label: "Relevance",
                        value: "",
                    },
                    {
                        label: "Popularity",
                        value: "popularity",
                    },
                    {
                        label: "Rank",
                        value: "rank",
                    },
                    {
                        label: "Rating",
                        value: "score",
                    },
                    {
                        label: "Title",
                        value: "title",
                    },
                    {
                        label: "Chapters",
                        value: "chapters",
                    },
                    {
                        label: "Volumes",
                        value: "volumes",
                    },
                    {
                        label: "Start date",
                        value: "start_date",
                    },
                    {
                        label: "End date",
                        value: "end_date",
                    },
                ],
                filters: [
                    {
                        type: "select",
                        value: {
                            name: "type",
                            label: "Type",
                            values: [
                                {
                                    label: "All",
                                    value: "",
                                },
                                {
                                    label: "Manga",
                                    value: "manga",
                                },
                                {
                                    label: "Light novel",
                                    value: "lightnovel",
                                },
                                {
                                    label: "One shot",
                                    value: "oneshot",
                                },
                                {
                                    label: "Doujinshi",
                                    value: "doujin",
                                },
                                {
                                    label: "Manhwa",
                                    value: "manhwa",
                                },
                                {
                                    label: "Manhua",
                                    value: "manhua",
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
                                    label: "Publishing",
                                    value: "publishing",
                                },
                                {
                                    label: "Hiatus",
                                    value: "hiatus",
                                },
                                {
                                    label: "Discontinued",
                                    value: "discontinued",
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
        },
    };

    private mediaFromAnimeJSON(anime: any): Media {
        return new Media(
            "anime",
            anime.mal_id,
            anime.titles.find((title: { type: string; title: string }) => {
                return title.type === "Default";
            }).title,
            anime.images.webp.large_image_url,
            null,
            anime.type,
            anime.status,
            anime.genres.map((genre: any) => genre.name),
            anime.aired.from ? new Date(anime.aired.from) : null,
            anime.aired.to ? new Date(anime.aired.to) : null,
            anime.rating
                ? ["R+", "Rx"].includes(anime.rating.slice(0, 2))
                : false,
            [`myanimelist:anime:${anime.mal_id.toString()}`]
        );
    }

    private async searchAnime(options: {
        [key: string]: any;
    }): Promise<[Media[], boolean]> {
        let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
            options.query
        )}`;

        if (options.sortBy != null) {
            url += `&order_by=${options.sortBy}&sort=asc`;
        }

        delete options.query;
        delete options.sortBy;

        url += `&${serializeURL(options)}`;

        const res = await fetch(url);

        if (res.ok === false) {
            console.log(res);
            return [[], true];
        }

        const data = await res.json();
        let animes: Media[] = data.data.map((anime: any) =>
            this.mediaFromAnimeJSON(anime)
        );

        return [animes, false];
    }

    private async getAnime({
        id,
    }: {
        id: string;
    }): Promise<[Media | null, boolean]> {
        let url = `https://api.jikan.moe/v4/anime/${id}/full`;

        const res = await fetch(url);

        if (res.ok === false) {
            return [null, true];
        }

        const data = await res.json();
        let anime = this.mediaFromAnimeJSON(data.data);

        return [anime, false];
    }

    private mediaFromMangaJSON(manga: any): Media {
        return new Media(
            "manga",
            manga.mal_id,
            manga.titles.find((title: { type: string; title: string }) => {
                return title.type === "Default";
            }).title,
            manga.images.webp.large_image_url,
            null,
            manga.type,
            manga.status,
            manga.genres.map((genre: any) => genre.name),
            manga.published.from ? new Date(manga.published.from) : null,
            manga.published.to ? new Date(manga.published.to) : null,
            manga.rating
                ? ["R+", "Rx"].includes(manga.rating.slice(0, 2))
                : false,
            [
                `myanimelist:manga:${manga.mal_id.toString()}`,
            ]
        );
    }

    private async searchManga(options: {
        [key: string]: any;
    }): Promise<[Media[], boolean]> {
        let url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(
            options.query
        )}`;

        if (options.sortBy != null) {
            url += `&order_by=${options.sortBy}&sort=asc`;
        }

        delete options.query;
        delete options.sortBy;

        url += `&${serializeURL(options)}`;

        const res = await fetch(url);

        if (res.ok === false) {
            console.log(res);
            return [[], true];
        }

        const data = await res.json();
        let mangas: Media[] = data.data.map((manga: any) =>
            this.mediaFromMangaJSON(manga)
        );

        return [mangas, false];
    }

    private async getManga({
        id,
    }: {
        id: string;
    }): Promise<[Media | null, boolean]> {
        let url = `https://api.jikan.moe/v4/manga/${id}/full`;

        const res = await fetch(url);

        if (res.ok === false) {
            return [null, true];
        }

        const data = await res.json();
        let manga = this.mediaFromMangaJSON(data.data);

        return [manga, false];
    }

    async search(
        type: MediaType,
        options: { [key: string]: any },
    ): Promise<[Media[], boolean]> {
        let result: [Media[], boolean];

        switch (type) {
            case "anime":
                result = await this.searchAnime(options);
                break;

            case "manga":
                result = await this.searchManga(options);
                break;

            default:
                console.log("API got an invalid media type:", type);
                result = [[], true];
        }

        return result;
    }

    async getMedia(
        { id }: { id: string },
        type: MediaType
    ): Promise<[Media | null, boolean]> {
        switch (type) {
            case "anime":
                return await this.getAnime({ id });

            case "manga":
                return await this.getManga({ id });

            default:
                return [null, true];
        }
    }
}
