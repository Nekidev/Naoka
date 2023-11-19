export type SearchType = "anime" | "manga";

interface Input {
    name: string;
    label: string;
}

export interface SelectInput extends Input {
    icon?: JSX.Element;
    values: {
        label: string;
        value: string;
    }[];
}

export interface RangeInput extends Input {
    start: number;
    end: number;
    steps: number;
}

export interface CheckboxInput extends Input {
    defaultValue: boolean;
}

interface SearchConfig {
    // Delay to wait after a key is pressed before executing a query. Will be 0
    // if no delay is specified. Use this to prevent 429 errors.
    typingDelay?: number;
    filters: (
        | {
              type: "select";
              value: SelectInput;
          }
        | {
              type: "range";
              value: RangeInput;
          }
        | {
              type: "checkbox";
              value: CheckboxInput;
          }
    )[];
}

export interface Config {
    search: {
        anime?: SearchConfig;
        manga?: SearchConfig;
        characters?: SearchConfig;
        people?: SearchConfig;
    };
}

export class Media {
    constructor(
        readonly id: string,
        readonly title: string,
        readonly description: string,
        readonly imageUrl: string,
        readonly bannerUrl: string | null,
        readonly format: string,
        readonly source: string,
        readonly status: string,
        readonly genres: string[],
        readonly startDate: Date | null,
        readonly endDate: Date | null,
        readonly rating: string | null,
        readonly isAdult: boolean,
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
        type: SearchType
    ): Promise<[Media[], boolean]> {
        /*
        Returns a tuple of an array of Anime objects and a boolean indicating if there was an error.
        */
        return [[], true];
    }
}
