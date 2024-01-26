import { generateCodeVerifier, generateRandomState } from "@/lib/crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get("key");
    const iv = request.nextUrl.searchParams.get("iv");
    const state = generateRandomState();
    const codeVerifier = generateCodeVerifier();

    if (!key || !iv) {
        redirect("/code?status=fail");
    }

    const cookieStore = cookies();
    cookieStore.set("key", key, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
        secure: true,
    });
    cookieStore.set("iv", iv, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
        secure: true,
    });
    cookieStore.set("code_verifier", codeVerifier, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
        secure: true,
    });
    cookieStore.set("state", state, {
        expires: new Date(new Date().getTime() + 5 * 60 * 1000),
        secure: true,
    });

    redirect(
        `https://myanimelist.net/v1/oauth2/authorize?client_id=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_REDIRECT_URI
        )}&response_type=code&state=${encodeURIComponent(
            state
        )}&code_challenge_method=plain&code_challenge=${encodeURIComponent(
            codeVerifier
        )}`
    );
}
