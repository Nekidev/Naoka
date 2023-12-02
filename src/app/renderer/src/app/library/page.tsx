"use client";

import Chip from "@/components/Chip";
import { LeftNavSpacer, VerticalNavSpacer } from "@/components/NavigationBar";
import {
    HeartIcon,
    MagnifyingGlassIcon,
    StarIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { cn } from "@/utils";
import TextInput from "@/components/TextInput";
import colors from "tailwindcss/colors";
import { db, LibraryEntry } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { LibraryStatus } from "@/lib/types";

export default function Library() {
    const [mediaTypeFilters, setMediaTypeFilters] = React.useState<
        Array<String>
    >([]);

    const [query, setQuery] = React.useState("");

    const libraryEntries = useLiveQuery(() => db.library.toArray());

    return (
        <main className="flex flex-col min-h-full">
            <div className="flex flex-row items-center">
                <VerticalNavSpacer />
                <LeftNavSpacer />
                <div className="flex flex-row gap-2 items-center">
                    <button
                        className={cn([
                            "p-2 rounded-full bg-zinc-800 transition hover:bg-zinc-700 disabled:opacity-60",
                            "disabled:hover:bg-zinc-800 disabled:cursor-not-allowed",
                        ])}
                        disabled={mediaTypeFilters.length === 0}
                        onClick={() => {
                            setMediaTypeFilters([]);
                        }}
                    >
                        <XMarkIcon className="h-4 w-4 stroke-2" />
                    </button>
                    {["favorites", "anime", "manga"].map((type) => (
                        <Chip
                            key={type}
                            label={
                                type.slice(0, 1).toUpperCase() + type.slice(1)
                            }
                            selected={mediaTypeFilters.includes(type)}
                            onClick={() => {
                                setMediaTypeFilters((v) => {
                                    if (v.includes(type)) {
                                        return v.filter((t) => t !== type);
                                    } else {
                                        return [...v, type];
                                    }
                                });
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className="px-4 py-2 flex flex-col gap-4">
                <TextInput
                    name="search"
                    icon={<MagnifyingGlassIcon className="h-6 w-6" />}
                    label={`Search in your library`}
                    value={query}
                    onChange={(e: any) => setQuery(e.target.value)}
                />
                <div className="flex flex-row items-center gap-4">
                    <StatusSelector
                        label="Not started"
                        color={colors.yellow["400"]}
                    />
                    <StatusSelector
                        label="Planned"
                        color={colors.pink["400"]}
                    />
                    <StatusSelector
                        label="In progress"
                        color={colors.blue["400"]}
                    />
                    <StatusSelector
                        label="Paused"
                        color={colors.orange["400"]}
                    />
                    <StatusSelector label="Dropped" color={colors.red["400"]} />
                    <StatusSelector
                        label="Completed"
                        color={colors.green["400"]}
                    />
                </div>
            </div>
            <div className="h-px bg-zinc-800 mt-2"></div>
            <div className="p-4 flex flex-col gap-4">
                {libraryEntries?.map((entry) => (
                    <LibraryEntryRow entry={entry} />
                ))}
            </div>
        </main>
    );
}

function StatusSelector({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex flex-row items-center gap-2">
            <div
                className="h-2 w-2 rounded-full"
                style={{
                    backgroundColor: color,
                }}
            ></div>
            <span className="text-sm leading-none text-zinc-400">{label}</span>
        </div>
    );
}

function LibraryEntryRow({ entry }: { entry: LibraryEntry }) {
    const media = useLiveQuery(() =>
        db.mediaCache.get({ mapping: entry.mapping })
    );

    if (!media) return null;

    const statusColors: { [key in LibraryStatus]: string } = {
        not_started: colors.yellow["400"],
        planned: colors.pink["400"],
        in_progress: colors.blue["400"],
        paused: colors.orange["400"],
        dropped: colors.red["400"],
        completed: colors.green["400"],
    };

    return (
        <div className="flex flex-row items-strtetch gap-4 p-2 -m-2 relative hover:bg-zinc-800 rounded transition cursor-pointer group">
            <div
                className="w-1 rounded-full"
                style={{
                    backgroundColor: statusColors[entry.status],
                }}
            ></div>
            <img
                src={media.imageUrl!}
                className="w-10 aspect-square rounded object-cover object-center"
            />
            <div className="flex flex-col justify-center text-zinc-300 group-hover:text-zinc-100 transition">
                {media.title}
                <span className="text-zinc-400 text-sm">
                    {media.type == "anime" ? "Anime" : "Manga"}
                </span>
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-row items-center gap-8">
                {entry.favorite ? (
                    <HeartIcon className="h-4 w-4 text-red-400 fill-red-400" />
                ) : (
                    <HeartIcon className="h-4 w-4 transition text-zinc-800 group-hover:text-zinc-700 fill-zinc-800 group-hover:fill-zinc-700" />
                )}
                <Stars rating={entry.score ? entry.score / 20 : 0} />
            </div>
        </div>
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex flex-row items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                    key={i}
                    className={cn([
                        "h-4 w-4 transition",
                        rating >= i + 1
                            ? rating < 3
                                ? "text-red-400 fill-red-400"
                                : rating == 3
                                ? "text-orange-400 fill-orange-400"
                                : "text-yellow-400 fill-yellow-400"
                            : "text-zinc-800 group-hover:text-zinc-700 fill-zinc-800 group-hover:fill-zinc-700",
                    ])}
                />
            ))}
        </div>
    );
}
