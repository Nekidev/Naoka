import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { encrypt } from "@/lib/crypto";
import { encodeGetParams } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const cookieStore = cookies();

    if (
        cookieStore.get("state")?.value !==
        request.nextUrl.searchParams.get("state")
    ) {
        redirect(`/code?status=fail&reason=state_mismatch`);
    }

    const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeGetParams({
            client_id: process.env.PROVIDER_MYANIMELIST_CLIENT_ID,
            client_secret: process.env.PROVIDER_MYANIMELIST_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: request.nextUrl.searchParams.get("code"),
            redirect_uri: process.env.PROVIDER_MYANIMELIST_REDIRECT_URI,
            code_verifier: cookieStore.get("code_verifier")?.value,
        }),
    });

    if (!res.ok) {
        redirect(`/code?status=fail&reason=error_status_code_response`);
    }

    redirect(
        `/code?status=success&code=${encrypt(
            await res.text(),
            Buffer.from(cookieStore.get("key")?.value!, "hex"),
            Buffer.from(cookieStore.get("iv")?.value!, "hex")
        )}`
    );
}
