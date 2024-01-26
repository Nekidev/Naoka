import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const cookieStore = cookies();

    if (
        cookieStore.get("state")?.value !==
        request.nextUrl.searchParams.get("state")
    ) {
        redirect(`/code?status=fail`);
    }

    const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: `grant_type=authorization_code&client_id=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_CLIENT_ID
        )}&client_secret=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_CLIENT_SECRET
        )}&redirect_uri=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_REDIRECT_URI
        )}&code=${request.nextUrl.searchParams.get("code")}&code_verifier=${
            cookieStore.get("code_verifier")?.value
        }`,
    });

    if (!res.ok) {
        redirect(`/code?status=fail`);
    }

    redirect(
        `/code?status=success&code=${encrypt(
            await res.text(),
            Buffer.from(cookieStore.get("key")?.value!, "hex"),
            Buffer.from(cookieStore.get("iv")?.value!, "hex")
        )}`
    );
}
