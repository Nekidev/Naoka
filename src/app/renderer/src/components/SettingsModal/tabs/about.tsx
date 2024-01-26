"use client";

import { Header, Paragraph } from "../components";
import { useMessages } from "@/lib/messages";
import pkg from "../../../../../package.json";
import { open } from "@tauri-apps/plugin-shell";

export default function About() {
    const m = useMessages();

    return (
        <>
            <Header
                title={m("settings_about_title")}
                subtitle={m("settings_about_subtitle")}
            />
            <Paragraph title="Version">
                {pkg.version} {process.env.NODE_ENV === "development" && "dev"}{" "}
                <button
                    className="text-blue-400 underline"
                    onClick={() =>
                        open("https://github.com/Nekidev/Naoka/releases")
                    }
                >
                    (Releases)
                </button>
            </Paragraph>
            <Paragraph title="Links">
                <div className="flex flex-row gap-2">
                    <button
                        className="text-blue-400 underline"
                        onClick={() =>
                            open("https://discord.gg/7UAxjtmmea")
                        }
                    >
                        Discord
                    </button>
                    <button
                        className="text-blue-400 underline"
                        onClick={() =>
                            open("https://discord.gg/7UAxjtmmea")
                        }
                    >
                        GitHub
                    </button>
                    <button
                        className="text-blue-400 underline"
                        onClick={() =>
                            open("https://ko-fi.com/nekidev")
                        }
                    >
                        Ko-fi
                    </button>
                    <button
                        className="text-blue-400 underline"
                        onClick={() =>
                            open("https://patreon.com/nekidev")
                        }
                    >
                        Patreon
                    </button>
                </div>
            </Paragraph>
            <Paragraph title="Contributors">
                <div className="grid grid-cols-3 relative gap-2 mt-1">
                    <Contributor
                        name="Nekidev"
                        id="777338793803513886"
                        contributions={["Author"]}
                    />
                </div>
            </Paragraph>
        </>
    );
}

function Contributor({
    name,
    id,
    contributions,
}: {
    name: string;
    id: string;
    contributions: string[];
}) {
    return (
        <div className="flex flex-row items-center gap-2 p-2 rounded bg-zinc-850 w-full">
            <img
                src={`https://nekosapi.com/api/discord/avatar?user_id=${id}`}
                className="h-8 w-8 rounded object-center object-cover"
            />
            <div className="flex flex-col gap-0.5">
                <div className="text-sm text-zinc-200 leading-none">{name}</div>
                <div className="text-xs text-zinc-400 line-clamp-2 leading-none">
                    {contributions.join(", ")}
                </div>
            </div>
        </div>
    );
}
