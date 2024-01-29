import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
    const { refresh_token } = await request.json();

    const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: `client_id=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_CLIENT_ID
        )}&client_secret=${encodeURIComponent(
            process.env.PROVIDER_MYANIMELIST_CLIENT_SECRET
        )}&grant_type=refresh_token&refresh_token=${encodeURIComponent(
            refresh_token
        )}`,
    });

    return Response.json(await res.json());
}
