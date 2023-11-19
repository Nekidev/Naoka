export function cn([...classes]: string[]): string {
    return classes.join(" ");
}

export function serializeURL(obj: { [key: string]: any }) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}
