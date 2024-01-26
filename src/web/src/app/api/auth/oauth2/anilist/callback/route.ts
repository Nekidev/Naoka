import * as crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function encrypt(string: string, key: string, iv: Buffer): string {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedString = cipher.update(string, "utf-8", "hex");
    encryptedString += cipher.final("hex");
    return encryptedString;
}

export async function GET(request: NextRequest) {
    const res = await fetch("https://anilist.co/api/v2/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: process.env.PROVIDER_ANILIST_CLIENT_ID,
            client_secret: process.env.PROVIDER_ANILIST_CLIENT_SECRET,
            redirect_uri: process.env.PROVIDER_ANILIST_REDIRECT_URI,
            code: request.nextUrl.searchParams.get("code"),
        }),
    });

    if (!res.ok) {
        redirect(`/code?status=fail`);
    }

    const json = await res.json();

    const cookieStore = cookies();

    redirect(
        `/code?status=success&key=${encrypt(
            json.access_token,
            cookieStore.get("key")?.value!,
            Buffer.from(cookieStore.get("iv")?.value!, "hex")
        )}`
    );
}
