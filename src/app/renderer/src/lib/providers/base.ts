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
    /**
     * Delay to wait after a key is pressed before executing a query. Will be 0
     * if no delay is specified. Use this to prevent 429 errors.
     */
    typingDelay?: number;

    // Sort options
    sortBy?: {
        label: string; // Human-readable label
        value: string; // Value passed to the `BaseProvider.search` method
    }[];

    // Filter options
    filters: Input[];
}

export interface Config {
    /**
     * Supported media types. For example, MangaDex will be ["manga"] while
     * AniList will be ["anime", "manga"].
     */
    mediaTypes: MediaType[];

    /**
     * Configuration for library syncronization.
     */
    syncing?: {
        /**
         * Syncronizable media types. For example, MangaDex will be ["manga"]
         * while AniList will be ["anime", "manga"].
         */
        mediaTypes: MediaType[];

        /**
         * The type of authentication to use
         *
         * oauth:
         *   OAuth2 login. Must add the implementation to the website to
         *   handle the flow. Check other implementations to
         *   see how to do this.
         *
         *   The encryption method used was intended to be so that the
         *   user's tokens aren't displayed when the app is being
         *   screen-shared. Unfortunately, this hasn't proved any
         *   usefulness since the key and IV are shared using GET requests
         *   to the server.
         *
         *   Maybe in the future we can make something so that they're
         *   shared using the web server that the app will bring
         *   incorporated in the future.
         *
         *   The `authorize` function will be passed an object with a
         *   `{ code: string }` object as the second argument. In this case,
         *   the code is the encrypted response from the website. It can be
         *   decrypted using the `decrypt` function at `@/lib/crypto`. The
         *   `key` will be stored in the session storage as
         *   `Naoka:Provider:{provider.name}:OAuthKey`. The `iv` will be
         *   stored in the session storage as
         *   `Naoka:Provider:{provider.name}:OAuthIV`.
         *
         * basic:
         *   (NOT IMPLEMENTED)
         *   The user will be asked to enter their username and password to
         *   authorize the app.
         *
         *   The `authorize` function will receive a
         *   `{ username: string; password: string; }` as the second
         *   argument.
         *
         * username:
         *   The user will be asked to enter their username to authorize
         *   the app. This may be useful when the user's information is
         *   public and the provider doesn't support updating the user's
         *   library.
         *
         * undefined:
         *   No authorization supported.
         */
        authType?: "oauth" | "basic" | "username";

        // Does the `getLibrary` method return entries in date sorted order?
        dateSorted?: boolean;
    };

    /**
     * Configuration for media searching.
     */
    search: {
        [key in MediaType]: SearchConfig;
    };

    /**
     * Reviews configuration.
     */
    reviews?: {
        // A validator function that is ran on every review update. It returns
        // whether the review is valid for publishing or not.
        validate?: (review: Review, media: Media) => boolean;
    };
}

export class BaseProvider {
    name!: string; // The provider's human-readable name.
    config!: Config; // The provider's configuration.

    /**
     * Search for media
     *
     * @param {MediaType} type    The type of the media to search for
     * @param {Object}    options Query, filters, etc. Variates depending on
     *                            each provider's configuration
     * @returns {Promise} The media and all the mappings for each media
     */
    async getSearch(
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
     * @returns {AsyncGenerator} The library entries, the media, and all mappings for each media, paginated by how the API returns the results. Each yielded value is a page of results
     */
    async *getUserLibrary(
        type: MediaType,
        account: ExternalAccount
    ): AsyncGenerator<{
        media: Media[];
        entries: LibraryEntry[];
        mappings: Mapping[][];
    }> {
        throw Error("Not implemented");
    }

    /**
     * Retrieves a library entry for the given account and entry, using the provided mappings.
     *
     * @param {ExternalAccount} account - the external account to retrieve the library entry for
     * @param {LibraryEntry} entry - the library entry to retrieve
     * @param {Mapping[]} mappings - the mappings to use for retrieval
     * @return {Promise<LibraryEntry>} a promise that resolves to the retrieved library entry
     */
    async getLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ): Promise<LibraryEntry> {
        throw Error("Not implemented");
    }

    /**
     * Updates a library entry.
     *
     * @param {MediaType} type - the type of media
     * @param {LibraryEntry} entry - the library entry to update
     * @param {Mapping[]} mappings - the mappings for the entry
     * @return {Promise<void>} a promise that resolves once the update is complete
     */
    async updateLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ): Promise<void> {
        throw Error("Not implemented");
    }

    /**
     * Deletes a library entry for a given account.
     *
     * @param {ExternalAccount} account - the external account
     * @param {LibraryEntry} entry - the library entry to delete
     * @return {Promise<void>} a promise that resolves with no value
     */
    async deleteLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ): Promise<void> {
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

    /**
     * Authorizes and updates the external account.
     *
     * @param {ExternalAccount} account - the external account to authorize
     * @param {{ [key: string]: any }} props - additional properties
     * @return {Promise<void>} throws an error indicating the function is not implemented
     */
    async authorize(account: ExternalAccount, props: { [key: string]: any }) {
        throw Error("Not implemented");
    }
}
