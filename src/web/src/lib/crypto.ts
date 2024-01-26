import crypto from "crypto";

export function encrypt(string: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedString = cipher.update(string, "utf-8", "hex");
    encryptedString += cipher.final("hex");
    return encryptedString;
}

export function generateCodeVerifier() {
    return base64URLEncode(crypto.randomBytes(32));
}

export function generateCodeChallenge(codeVerifier: string) {
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();
    return base64URLEncode(hash);
}

export function generateRandomState() {
    return base64URLEncode(crypto.randomBytes(16));
}

function base64URLEncode(str: Buffer) {
    return str
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
