/**
 * This will probably become useless if #172 is accepted since no more
 * encryption/decription will be used. The purpose of this file was to encrypt
 * the access tokens of accounts when being exchanged in the oauth2 flow so
 * that if the screen was being shared these wouldn't be exposed, but it was
 * useless because they are sent to the server via GET parameters, which are
 * displayed in the URL when the authorization flow starts.
 * 
 * #172: https://github.com/Nekidev/Naoka/issues/172
 */

import * as crypto from "crypto";

/**
 * 
 * @param text The content (stringified) to encrypt
 * @param key The key to encrypt the content with
 * @param iv A randomly generated 16-bytes-long initialization vector (must be
 *           remembered together with the key to decrypt the message)
 * @returns 
 */
export function encrypt(text: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}


/**
 * Decrypts the given encrypted text using the provided key and IV.
 *
 * @param {string} encryptedText the text to be decrypted
 * @param {Buffer} key the key used for decryption
 * @param {Buffer} iv the initialization vector
 * @return {string} the decrypted text
 */
export function decrypt(encryptedText: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
