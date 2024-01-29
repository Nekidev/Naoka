import { IndexableType } from "dexie";
import { db } from ".";
import { Mapping, Mappings, Media, Provider } from "./types";
import { useLiveQuery } from "dexie-react-hooks";
import { useSelectedProvider } from "../providers/hooks";

/**
 * Updates mappings in the database. If one of the mappings in the array is
 * found in the db, the rest are added to the existing DB entry. If none of
 * them exists, a new entry is created. If more than one exists, the existing
 * entries are merged into a single one and the rest are added to the new
 * merged entry.
 *
 * @param {Mapping[]} mappings       The mappings to update. All these mappings
 *                                   must belong to the same media.
 * @returns {Promise<IndexableType>} The updated Mappings entry ID.
 */
export async function updateMappings(
    mappings: Mapping[]
): Promise<IndexableType> {
    const existingMappingsObjects = await db.mappings
        .where("mappings")
        .anyOf(mappings)
        .toArray();

    if (existingMappingsObjects.length === 0) {
        return await db.mappings.add({ mappings });
    } else if (existingMappingsObjects.length === 1) {
        let existingMappings = existingMappingsObjects[0];
        existingMappings.mappings = [
            ...new Set([...existingMappings.mappings, ...mappings]),
        ];
        return await db.mappings.update(existingMappings.id!, existingMappings);
    } else {
        let existingMappingsIDs = existingMappingsObjects.map(
            (m: Mappings) => m.id!
        );
        let newMappingsObject = {
            mappings: [
                ...new Set([
                    ...existingMappingsObjects.flatMap(
                        (m: Mappings) => m.mappings
                    ),
                    ...mappings,
                ]),
            ],
        };
        await db.mappings.bulkDelete(existingMappingsIDs);
        return await db.mappings.add(newMappingsObject);
    }
}

/**
 * Checks if the given mapping is from the specified provider.
 *
 * @param {Mapping} mapping The mapping to check.
 * @param {string} provider The provider to compare against.
 * @return {boolean} True if the mapping is from the provider, false otherwise.
 */
export function isMappingFromProvider(
    mapping: Mapping,
    provider: Provider
): boolean {
    return mapping.split(":")[0] === provider;
}

/**
 * Retrieves media data based on the provided mapping and optional provider.
 *
 * @param {Mapping} mapping The mapping to retrieve media data for.
 * @param {Provider} provider The optional provider to filter the media data by.
 * @return {Media | undefined} The retrieved media data.
 */
export function useMedia(
    mapping: Mapping,
    provider: Provider | undefined = undefined
) {
    const [selectedProvider] = useSelectedProvider();

    return useLiveQuery(async () => {
        return await getMedia(mapping, provider ?? selectedProvider);
    }, [mapping, provider]);
}

/**
 * Retrieves the media from the specified provider from the database
 * based on the given mapping and provider.
 *
 * @param {Mapping} mapping The mapping object.
 * @param {Provider} provider The provider object.
 * @return {Promise<Media>} The media object.
 */
export async function getMedia(mapping: Mapping, provider: Provider) {
    if (!isMappingFromProvider(mapping, provider)) {
        const mappings = await db.mappings
            .where("mappings")
            .equals(mapping)
            .first();
        const mappingFromProvider = mappings?.mappings.find(
            (m: Mapping) => m.split(":", 2)[0] === provider
        );

        if (mappingFromProvider)
            return (
                (await db.media.get({ mapping: mappingFromProvider })) ??
                (await db.media.get({ mapping }))
            );
    }
    return await db.media.get({ mapping });
}

/**
 * Retrieves media in bulk based on the provided mappings and provider.
 *
 * @param {Mapping[]} mappings The array of mappings to filter media.
 * @param {Provider} provider The provider to retrieve media from.
 * @return {Promise<Media[]>} Returns a promise that resolves to an array of media objects.
 */
export async function getBulkMedia(mappings: Mapping[], provider: Provider): Promise<(Media | undefined)[]> {
    let allMappings = (
        await db.mappings.where("mappings").anyOf(mappings).distinct().toArray()
    ).map((m) => m.mappings);

    allMappings.sort((a, b) => {
        const indexA = mappings.indexOf(
            a.find((item) => mappings.includes(item))!
        );
        const indexB = mappings.indexOf(
            b.find((item) => mappings.includes(item))!
        );

        return indexA - indexB;
    });

    let media = await db.media.bulkGet(allMappings.flat());

    return mappings.map((mapping: Mapping) => {
        let mappingsObject = allMappings.find((ms) => ms.includes(mapping));
        if (mappingsObject !== undefined) {
            let matchingMedia = media.filter((m) =>
                mappingsObject!.includes(m?.mapping!)
            );
            return (
                matchingMedia.find((m) =>
                    isMappingFromProvider(m!.mapping, provider)
                ) ?? matchingMedia[0]
            );
        }
    });
}
