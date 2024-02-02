import { db } from "../db";
import { BaseProvider } from "./base";
import {
    ExternalAccount,
    LibraryEntry,
    Mapping,
    Media,
    MediaRating,
    MediaType,
    Provider,
    UserData,
} from "../db/types";

import { AniList } from "./anilist";
import { MyAnimeList } from "./myanimelist";

import { updateMappings } from "../db/utils";

// Add new providers here
export const providers = {
    anilist: new AniList(),
    myanimelist: new MyAnimeList(),
};

export class ProviderAPI {
    private api!: BaseProvider;
    code!: Provider;

    /**
     * Getter for the config property.
     *
     * @return {type} description of return value
     */
    get config() {
        return this.api.config;
    }

    /**
     * A getter function for retrieving the name property.
     *
     * @return {string} the value of the name property
     */
    get name() {
        return this.api.name;
    }

    /**
     * Constructor for the Provider class.
     *
     * @param {Provider} code - the code parameter
     * @return {void}
     */
    constructor(code: Provider) {
        const api: BaseProvider = providers[code as keyof typeof providers];
        this.api = api;
        this.code = code;
    }

    /**
     * Asynchronously retrieves search results based on the specified media type and options.
     *
     * @param {MediaType} type - the type of media to search for
     * @param {Object} options - the search options
     * @return {Promise<Media[]>} a promise that resolves with the array of media objects
     */
    async getSearch(
        type: MediaType,
        options: { [key: string]: any }
    ): Promise<Media[]> {
        let adultFilter = JSON.parse(
            localStorage.getItem("Naoka:Settings:AdultFilter") ?? "true"
        );
        let { media, mappings } = await this.api.getSearch(type, {
            ...options,
            adult: !adultFilter,
        });

        (async () => {
            await db.media.bulkPut(media);
            for (const ms of mappings) {
                await updateMappings(ms);
            }
        })().then(() => {});

        if (adultFilter) {
            // No adult content allowed
            media = media.filter(
                (m: Media) =>
                    !m.isAdult &&
                    ![MediaRating.RPlus, MediaRating.Rx].includes(m.rating!)
            );
        }

        return media;
    }

    /**
     * Asynchronously retrieves media of a specific type and ID,
     * stores the media in the database, updates the mappings,
     * and returns the retrieved media.
     *
     * @param {MediaType} type - the type of media to retrieve
     * @param {string} id - the ID of the media to retrieve
     * @return {Promise<Media>} the retrieved media
     */
    async getMedia(type: MediaType, id: string): Promise<Media> {
        const { media, mappings } = await this.api.getMedia(type, id);

        (async () => {
            await db.media.put(media);
            await updateMappings(mappings);
        })().then(() => {});

        return media;
    }

    /**
     * A generator function that asynchronously yields user library items.
     *
     * @param {MediaType} type - the type of media
     * @param {ExternalAccount} account - the external account
     * @return {AsyncGenerator<LibraryItem, void, unknown>} An asynchronous generator of library items
     */
    async *getUserLibrary(type: MediaType, account: ExternalAccount) {
        for await (const {
            media,
            mappings,
            entries,
        } of this.api.getUserLibrary(type, account)) {
            (async () => {
                await db.media.bulkPut(media);
                for (const ms of mappings) {
                    await updateMappings(ms);
                }
            })();

            yield { media, mappings, entries };
        }
    }

    /**
     * Retrieves a library entry for the specified account using the provided entry and mappings.
     *
     * @param {ExternalAccount} account - The external account for which the library entry is being retrieved
     * @param {LibraryEntry} entry - The library entry to be retrieved
     * @param {Mapping[]} mappings - The array of mappings associated with the library entry
     * @return {Promise<any>} A promise that resolves to the retrieved library entry
     */
    async getLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.getLibraryEntry(account, entry, mappings);
    }

    /**
     * Update a library entry for a given account.
     *
     * @param {ExternalAccount} account - the external account to update
     * @param {LibraryEntry} entry - the library entry to update
     * @param {Mapping[]} mappings - an array of mappings
     * @return {Promise<void>} a promise that resolves when the update is complete
     */
    async updateLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.updateLibraryEntry(account, entry, mappings);
    }

    /**
     * Delete a library entry for a given account.
     *
     * @param {ExternalAccount} account - the account for which the library entry is being deleted
     * @param {LibraryEntry} entry - the library entry to be deleted
     * @param {Mapping[]} mappings - the mappings associated with the library entry
     * @return {Promise<void>} a promise that resolves when the library entry is deleted
     */
    async deleteLibraryEntry(
        account: ExternalAccount,
        entry: LibraryEntry,
        mappings: Mapping[]
    ) {
        return this.api.deleteLibraryEntry(account, entry, mappings);
    }

    /**
     * Asynchronously retrieves user data based on the provided external account.
     *
     * @param {ExternalAccount} account - the external account for which user data is to be retrieved
     * @return {Promise<UserData>} the user data retrieved from the API
     */
    async getUser(account: ExternalAccount): Promise<UserData> {
        return this.api.getUser(account);
    }

    /**
     * Asynchronously authorizes an account using the specified properties.
     *
     * @param {ExternalAccount} account - the external account to authorize
     * @param {{ [key: string]: any }} props - the properties for authorization
     * @return {Promise<any>} the result of the authorization
     */
    async authorize(account: ExternalAccount, props: { [key: string]: any }) {
        return this.api.authorize(account, props);
    }
}
