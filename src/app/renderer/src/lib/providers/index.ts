import { ExternalAccount } from "../db";
import { MediaType, Mapping } from "../types";

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

export interface Config {
    mediaTypes: MediaType[];
    importableListTypes: MediaType[];
    search: {
        anime?: SearchConfig;
        manga?: SearchConfig;
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
        readonly episodes: number | null,
        readonly chapters: number | null,
        readonly volumes: number | null,
        readonly duration: number | null,
        readonly isAdult: boolean,
        readonly mappings: Mapping[]
    ) {}
}

export class BaseAPI {
    title!: string;
    config!: Config;

    async search(
        type: MediaType,
        options: {
            [key: string]: any;
        }
    ): Promise<[Media[], boolean]> {
        /*
        Returns a tuple of an array of Anime objects and a boolean indicating
        if there was an error.
        */
        throw Error("Not implemented");
    }

    async getMedia(
        type: MediaType,
        { id }: { id: string }
    ): Promise<[Media | null, boolean]> {
        /*
        Returns a tuple of a Media object and a boolean indicating if there was
        an error.
        */
        throw Error("Not implemented");
    }

    async importList(type: MediaType, account: ExternalAccount, override: boolean = false) {
        /*
        Imports the list from the external account (only `type` items) and
        creates necesary mediaCache items.
        */
        throw Error("Not implemented");
    }
}
