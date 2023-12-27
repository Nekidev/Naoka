/**
 * Concatenates an array of strings into a single string.
 *
 * @param {string[]} classes - An array of strings representing CSS classes.
 * @return {string} The concatenated string of CSS classes.
 */
export function cn([...classes]: string[]): string {
    return classes.join(" ");
}

/**
 * Serializes an object into a URL query string.
 *
 * @param {Object} obj - The object to be serialized.
 * @return {string} The serialized URL query string.
 */
export function serializeURL(obj: { [key: string]: any }) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

/**
 * Trims leading, trailing, and double whitespaces from a string.
 *
 * @param {string} str - The string to trim.
 * @return {string} The trimmed string.
 */
export function allTrim(str: string): string {
    return str.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
}
