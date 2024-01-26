import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

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
        `/code?status=success&code=${encrypt(
            json.access_token,
            Buffer.from(cookieStore.get("key")?.value!, "hex"),
            Buffer.from(cookieStore.get("iv")?.value!, "hex")
        )}`
    );
}
