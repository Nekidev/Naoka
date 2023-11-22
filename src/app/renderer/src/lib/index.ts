export type MediaType = "anime" | "manga";

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
    sortBy?: {
        label: string;
        value: string;
    }[];
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

interface Mapping {
    type: MediaType;
    provider: string;
    id: string;
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
        readonly type: MediaType,
        readonly id: string,
        readonly title: string,
        readonly imageUrl: string,
        readonly bannerUrl: string | null,
        readonly format: string,
        readonly status: string,
        readonly genres: string[],
        readonly startDate: Date | null,
        readonly endDate: Date | null,
        readonly isAdult: boolean,
        readonly mappings: Mapping[]
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
            sortBy,
        }: {
            query: string;
            sortBy: string | null;
        },
        type: MediaType
    ): Promise<[Media[], boolean]> {
        /*
        Returns a tuple of an array of Anime objects and a boolean indicating if there was an error.
        */
        throw Error("Not implemented");
    }

    async getMedia(
        { id }: { id: string },
        type: MediaType
    ): Promise<[Media | null, boolean]> {
        /*
        Returns a tuple of a Media object and a boolean indicating if there was an error.
        */
        throw Error("Not implemented");
    }
}

export type APIProvider = "myanimelist";
