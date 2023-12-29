import { IndexableType } from "dexie";
import { db } from ".";
import { Mapping, Provider } from "./types";
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
    const existingEntries = db.mappings.where("mappings").anyOf(mappings);
    const existingEntriesCount = await existingEntries.count();
    const existingEntriesArray = await existingEntries.toArray();

    if (existingEntriesCount === 0) {
        return await db.mappings.add({
            mappings,
        });
    } else if (existingEntriesCount === 1) {
        const existingEntry = await existingEntries.first();
        const mergedEntry = {
            // Remove duplicate mappings
            mappings: [...new Set([...existingEntry!.mappings, ...mappings])],
        };

        return await db.mappings.update(existingEntry!.id!, mergedEntry);
    } else {
        const existingMappings = existingEntriesArray.map(
            (value) => value.mappings
        );
        let newMappings: Mapping[] = mappings;

        for (const entryMappings of existingMappings) {
            for (const mapping of entryMappings) {
                newMappings.push(mapping);
            }
        }

        const newEntry = await db.mappings.add({
            mappings: [...new Set(newMappings)],
        });
        await db.mappings.bulkDelete(
            existingEntriesArray.map((value) => value.id) as number[]
        );

        return newEntry;
    }
}

/**
 * Checks if the given mapping is from the specified provider.
 *
 * @param {Mapping} mapping - The mapping to check.
 * @param {string} provider - The provider to compare against.
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
 * @param {Mapping} mapping - The mapping to retrieve media data for.
 * @param {Provider} provider - The optional provider to filter the media data by.
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
                db.media.get({ mapping })
            );
    }
    return await db.media.get({ mapping });
}
