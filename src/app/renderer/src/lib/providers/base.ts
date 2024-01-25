import {
    ExternalAccount,
    LibraryEntry,
    Mapping,
    Media,
    MediaType,
    Review,
    UserData,
} from "../db/types";
import Input from "../forms";

interface SearchConfig {
    // Delay to wait after a key is pressed before executing a query. Will be 0
    // if no delay is specified. Use this to prevent 429 errors.
    typingDelay?: number;
    sortBy?: {
        label: string;
        value: string;
    }[];
    filters: Input[];
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
        [key in MediaType]: SearchConfig;
    };
    reviews?: {
        validator?: (review: Review, media: Media) => boolean;
    };
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
