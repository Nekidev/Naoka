export interface TextInput {
    name: string;
    label: string;
    icon?: JSX.Element;
}

export interface SelectInput {
    name: string;
    label: string;
    icon?: JSX.Element;
    values: {
        label: string;
        value: string;
        default?: boolean;
    }[];
}

interface SearchConfig {
    // Delay to wait after a key is pressed before executing a query. Will be 0
    // if no delay is specified. Use this to prevent 429 errors.
    typingDelay?: number;
    filters: (
        | {
              type: "text";
              value: TextInput;
          }
        | {
              type: "select";
              value: SelectInput;
          }
    )[];
};

export interface Config {
    search: {
        anime?: SearchConfig;
        manga?: SearchConfig;
        characters?: SearchConfig;
        people?: SearchConfig;
    };
}

export class Anime {
    constructor(
        readonly id: string,
        readonly title: string,
        readonly description: string,
        readonly imageUrl: string,
        readonly bannerUrl: string | null,
        readonly format: string,
        readonly source: string,
        readonly status: string
    ) {}
}

export class BaseAPI {
    title: string = "site";
    config: Config = {
        search: {},
    };

    async search(
        {
            query,
        }: {
            query: string;
        },
        type: "anime" = "anime"
    ): Promise<[Anime[], boolean]> {
        /*
        Returns a tuple of an array of Anime objects and a boolean indicating if the search was successful.
        */
        return [[], false];
    }
}
