import { IndexableType } from "dexie";
import { db } from ".";
import { Mapping } from "../types";

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
