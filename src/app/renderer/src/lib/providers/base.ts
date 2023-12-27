import { ExternalAccount, LibraryEntry, Media, UserData } from "../db";
import { MediaType, Mapping } from "../types";

// TODO: Create a forms.ts with all these interfaces so that they can be reused
// in different components.

interface Input {
    name: string;
    label: string;
}

export interface SelectInput extends Input {
    icon?: JSX.Element;
    options: {
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
    syncing?: {
        auth: {
            type: "oauth" | "basic" | "client" | "none";
        };
        import?: {
            // Importable list types.
            mediaTypes: MediaType[];
        };
        export?: {
            // Importable list types.
            mediaTypes: MediaType[];
        };
    };
    search: {
        anime?: SearchConfig;
        manga?: SearchConfig;
    };
}

export enum ImportMethod {
    // Keep the current library entry
    Keep,

    // Keep the new library entry
    Overwrite,

    // Keep the lastest library entry
    Latest,
}

export class BaseProvider {
    name!: string;
    config!: Config;

    /**
     * Search for media
     *
     * @param {MediaType} type    The type of the media to search for
     * @param {Object}    options Query, filters, etc. Variates depending on
     *                            each provider's configuration
     * @returns {Promise} The media and all the mappings for each media
     */
    async search(
        type: MediaType,
        options: {
            [key: string]: any;
        }
    ): Promise<{ media: Media[]; mappings: Mapping[][] }> {
        throw Error("Not implemented");
    }

    /**
     * Returns a media by it's ID
     *
     * @param {MediaType} type The type of the media to get
     * @param {string}    id   The ID of the media to get
     * @returns {Promise} The media and all mappings for that media
     */
    async getMedia(
        type: MediaType,
        id: string
    ): Promise<{ media: Media; mappings: Mapping[] }> {
        throw Error("Not implemented");
    }

    /**
     * Returns all library entries for a given account
     *
     * @param {MediaType}       type    The media type of the library
     * @param {ExternalAccount} account The account to get the library from
     * @returns {Promise} The library entries, the media, and all mappings for each media
     */
    async getLibrary(
        type: MediaType,
        account: ExternalAccount
    ): Promise<{
        media: Media[];
        entries: LibraryEntry[];
        mappings: Mapping[][];
    }> {
        throw Error("Not implemented");
    }

    /**
     * Get details of a given account
     *
     * @param {ExternalAccount} account The account to get the details from
     * @returns {Promise} The account details
     */
    async getUser(account: ExternalAccount): Promise<UserData> {
        /*
        Returns basic user data from the external account.
        */
        throw Error("Not implemented");
    }
}
