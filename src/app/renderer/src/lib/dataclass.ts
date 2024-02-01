/**
 * A very basic dataclass used with Dexie.js to map table rows to objects to be
 * able to add methods to them.
 */
export class Dataclass {
    constructor(initProps: { [key: string]: any }) {
        Object.entries(initProps).map(([k, v]) => {
            this[k as keyof typeof this] = v;
        })
    }
}
