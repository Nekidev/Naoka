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
import { LibraryStatus, Mapping } from "@/lib/types";
import LibraryEntryModal from "@/components/LibraryEntryModal";
import { useDebounce } from "@uidotdev/usehooks";
import { motion, AnimatePresence } from "framer-motion";

export default function Library() {
    const [mediaTypeFilters, setMediaTypeFilters] = React.useState<
        Array<String>
    >([]);
    const [statusFilters, setStatusFilters] = React.useState<LibraryStatus[]>(
        []
    );

    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebounce(query, 300);

    const libraryEntries = useLiveQuery(() => {
        return db.library.toArray(async (array: LibraryEntry[]) => {
            let result = [];

            for (let entry of array) {
                if (mediaTypeFilters.length > 0) {
                    if (
                        (mediaTypeFilters.includes("favorites") &&
                            !entry.favorite) ||
                        ((mediaTypeFilters.includes("anime") ||
                            mediaTypeFilters.includes("manga")) &&
                            !mediaTypeFilters.includes(entry.type))
                    ) {
                        continue;
                    }
                }

                if (statusFilters.length > 0) {
                    if (!statusFilters.includes(entry.status)) {
                        continue;
                    }
                }

                entry.media = await db.media.get({
                    mapping: entry.mapping,
                });

                if (
                    !entry.media?.title
                        .toLowerCase()
                        .includes(query.toLowerCase())
                ) {
                    continue;
                }

                result.push(entry);
            }

            return result;
        });
    }, [debouncedQuery, mediaTypeFilters, statusFilters]);

    const [openModalMapping, setOpenModalMapping] =
        React.useState<null | Mapping>(null);

    function handleOnStatusSelectorClick(status: LibraryStatus) {
        return function () {
            if (statusFilters.includes(status)) {
                setStatusFilters(statusFilters.filter((s) => s !== status));
            } else {
                setStatusFilters([...statusFilters, status]);
            }
        };
    }

    return (
        <>
            <main className="flex flex-col min-h-full max-h-full overflow-y-auto">
                <div className="sticky top-0 shrink-0 bg-zinc-900 z-10">
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
                                        type.slice(0, 1).toUpperCase() +
                                        type.slice(1)
                                    }
                                    selected={mediaTypeFilters.includes(type)}
                                    onClick={() => {
                                        setMediaTypeFilters((v) => {
                                            if (v.includes(type)) {
                                                return v.filter(
                                                    (t) => t !== type
                                                );
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
                            <AnimatePresence>
                                {statusFilters.length > 0 && (
                                    <motion.button
                                        initial={{
                                            marginLeft: "-1rem",
                                            marginRight: "-1rem",
                                            width: "0rem",
                                            opacity: 0,
                                        }}
                                        animate={{
                                            marginLeft: "-0.5rem",
                                            marginRight: "-0.5rem",
                                            width: "1rem",
                                            opacity: 1,
                                        }}
                                        exit={{
                                            marginLeft: "-1rem",
                                            marginRight: "-1rem",
                                            width: "0rem",
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                        className="p-2 -mx-2 -my-3 box-content overflow-hidden"
                                        onClick={() => {
                                            setStatusFilters([]);
                                        }}
                                    >
                                        <XMarkIcon className="h-4 w-4 stroke-2" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <StatusSelector
                                label="Not started"
                                color={colors.yellow["400"]}
                                selected={statusFilters.includes("not_started")}
                                onClick={handleOnStatusSelectorClick(
                                    "not_started"
                                )}
                            />
                            <StatusSelector
                                label="Planned"
                                color={colors.pink["400"]}
                                selected={statusFilters.includes("planned")}
                                onClick={handleOnStatusSelectorClick("planned")}
                            />
                            <StatusSelector
                                label="In progress"
                                color={colors.blue["400"]}
                                selected={statusFilters.includes("in_progress")}
                                onClick={handleOnStatusSelectorClick(
                                    "in_progress"
                                )}
                            />
                            <StatusSelector
                                label="Paused"
                                color={colors.orange["400"]}
                                selected={statusFilters.includes("paused")}
                                onClick={handleOnStatusSelectorClick("paused")}
                            />
                            <StatusSelector
                                label="Dropped"
                                color={colors.red["400"]}
                                selected={statusFilters.includes("dropped")}
                                onClick={handleOnStatusSelectorClick("dropped")}
                            />
                            <StatusSelector
                                label="Completed"
                                color={colors.green["400"]}
                                selected={statusFilters.includes("completed")}
                                onClick={handleOnStatusSelectorClick(
                                    "completed"
                                )}
                            />
                        </div>
                    </div>
                    <div className="h-px shrink-0 bg-zinc-800 mt-2"></div>
                </div>
                {libraryEntries ? (
                    libraryEntries.length > 0 ? (
                        <div className="p-4 flex flex-col gap-4">
                            {libraryEntries.map((entry) => (
                                <LibraryEntryRow
                                    key={entry.mapping}
                                    entry={entry}
                                    openModal={() =>
                                        setOpenModalMapping(entry.mapping)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-zinc-300">
                            <div className="mb-2">(╥﹏╥)</div>
                            <div>There's nothing here!</div>
                            {(statusFilters.length > 0 ||
                                mediaTypeFilters.length > 0 ||
                                debouncedQuery.length > 0) && (
                                <div className="opacity-50 text-xs">
                                    (Try clearing your filters)
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-6 w-6 border-2 border-white/90 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </main>
            <LibraryEntryModal
                mapping={openModalMapping}
                closeModal={() => setOpenModalMapping(null)}
            />
        </>
    );
}

function StatusSelector({
    color,
    label,
    selected,
    onClick,
}: {
    color: string;
    label: string;
    selected: boolean;
    onClick: any;
}) {
    return (
        <button
            className={`flex flex-row items-center gap-2 transition cursor-pointer ${
                selected
                    ? "text-zinc-100 hover:text-zinc-300"
                    : "text-zinc-400 hover:text-zinc-100"
            }`}
            onClick={onClick}
        >
            <div
                className="h-2 w-2 rounded-full"
                style={{
                    backgroundColor: color,
                }}
            ></div>
            <span className="text-sm leading-none">{label}</span>
        </button>
    );
}

function LibraryEntryRow({
    entry,
    openModal,
}: {
    entry: LibraryEntry;
    openModal: any;
}) {
    const statusColors: { [key in LibraryStatus]: string } = {
        not_started: colors.yellow["400"],
        planned: colors.pink["400"],
        in_progress: colors.blue["400"],
        paused: colors.orange["400"],
        dropped: colors.red["400"],
        completed: colors.green["400"],
    };

    return (
        <div
            className="flex flex-row items-strtetch gap-4 p-2 -m-2 relative hover:bg-zinc-800 rounded transition cursor-pointer group"
            onClick={() => openModal()}
        >
            <div
                className="w-1 rounded-full"
                style={{
                    backgroundColor: statusColors[entry.status],
                }}
            ></div>
            {entry.media ? (
                <img
                    src={entry.media.imageUrl!}
                    alt={entry.media.title}
                    className="w-10 aspect-square rounded object-cover object-center"
                />
            ) : (
                <div className="w-10 aspect-square rounded bg-zinc-800 group-hover:bg-zinc-700 transition animate-pulse"></div>
            )}
            <div className="flex flex-col gap-1 justify-center text-zinc-300 group-hover:text-zinc-100 transition">
                {entry.media ? (
                    <span className="line-clamp-1 leading-none">
                        {entry.media?.title}
                    </span>
                ) : (
                    <div
                        className="h-4 rounded bg-zinc-800 group-hover:bg-zinc-700 transition animate-pulse"
                        style={{ width: Math.random() * 200 + 30 + "px" }}
                    ></div>
                )}
                <span className="text-zinc-400 text-sm leading-none">
                    {entry.type == "anime" ? "Anime" : "Manga"}
                </span>
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-row items-center gap-8 text-zinc-400 text-sm whitespace-nowrap">
                {entry.type == "anime" ? (
                    <span>{entry.episodeProgress} eps.</span>
                ) : (
                    <span>
                        {entry.chapterProgress} chs., {entry.volumeProgress}{" "}
                        vol.
                    </span>
                )}
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
