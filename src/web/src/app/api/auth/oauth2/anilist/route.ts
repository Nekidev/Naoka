import * as crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get("key");
    const iv = request.nextUrl.searchParams.get("iv");

    if (!key || !iv) {
        redirect("/code?status=fail");
    }

    const cookieStore = cookies();
    cookieStore.set("key", key, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
    });
    cookieStore.set("iv", iv, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
    });

    redirect(
        `https://anilist.co/api/v2/oauth/authorize?client_id=${encodeURIComponent(
            process.env.PROVIDER_ANILIST_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(
            process.env.PROVIDER_ANILIST_REDIRECT_URI
        )}&response_type=code`
    );
}
