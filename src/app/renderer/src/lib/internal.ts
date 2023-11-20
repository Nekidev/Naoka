import { MediaType } from ".";

type RatingFormat =
    | "10_stars"
    | "5_stars"
    | "3_stars"
    | "100_score"
    | "10_score";

type FavoritesIcon = "star" | "heart" | "thumbs_up";

interface Mapping {
    type: MediaType;
    provider: string;
    providerId: string;
}

type WatchlistStatus = null | "planned" | "in_progress" | "paused" | "dropped" | "completed";

interface Config {
    config: {
        media: {
            ratingFormat: RatingFormat;
            showAdultContent: boolean;
            favoritesIcon: FavoritesIcon;
        };
        app: {
            theme: "light" | "dark";
            color: {
                h: number;
                s: number;
            };
            language: "en";
        };
    };
    db: {
        providers: {
            [key: string]: any;
        };
        mediaCache: {
            type: MediaType;
            title: string;
            imageUrl: string | null;
            bannerUrl: string | null;
            mappings: Mapping[];
        }[];
        watchlist: {
            type: MediaType;
            status: WatchlistStatus;
            progress: Number;
            rating: Number | null;
            startDate: Date | null;
            endDate: Date | null;
            notes: string;
            mapping: Mapping;
        }[];
        lists: {
            name: string;
            items: Mapping[];
        }[];
    };
}

export class InternalAPI {
    constructor() {
        if (!window.localStorage.getItem("naoka")) {
            const newConfig: Config = {
                config: {
                    media: {
                        ratingFormat: "5_stars",
                        showAdultContent: false,
                        favoritesIcon: "star",
                    },
                    app: {
                        theme: "dark",
                        color: {
                            h: 0,
                            s: 0
                        },
                        language: "en"
                    }
                },
                db: {
                    providers: {
                        myanimelist: {},
                        anilist: {},
                        kitsu: {},
                    },
                    mediaCache: [],
                    watchlist: [],
                    lists: []
                }
            }

            window.localStorage.setItem("naoka", JSON.stringify(newConfig));
        }
    }
}
