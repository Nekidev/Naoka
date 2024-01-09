"use client";

import React from "react";
import {
    MagnifyingGlassIcon,
    Bars4Icon,
    Squares2X2Icon,
    PlusIcon,
    CheckIcon,
    HeartIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { VerticalNavSpacer, LeftNavSpacer } from "@/components/NavigationBar";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";
import LibraryEntryModal from "@/components/LibraryEntryModal";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { defaultLibraryEntry } from "@/lib/db/defaults";
import Chip from "@/components/Chip";
import TextInput from "@/components/TextInput";
import AddToListModal from "@/components/AddToListModal";
import { ProviderAPI } from "@/lib/providers";
import {
    LibraryStatus,
    Mapping,
    Media,
    MediaGenre,
    MediaRating,
    MediaType,
    Provider,
} from "@/lib/db/types";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useMessages } from "@/lib/messages";
import { Messages } from "@/lib/messages/translations";
import {
    SelectInput as SelectInputInterface,
    CheckboxInput as CheckboxGroupInterface,
    InputType,
} from "@/lib/forms";
import { getMediaTitle, useTitleLanguage } from "@/lib/settings";

export default function Search() {
    const m = useMessages();

    const [searchType, setSearchType] = React.useState<MediaType>("anime");
    const [selectedProvider] = useLocalStorage(
        "Naoka:Provider:Selected",
        "anilist"
    );

    const api = new ProviderAPI(selectedProvider as Provider);

    const [displayMode, setDisplayMode] = React.useState<"list" | "grid">(
        "list"
    );
    const [query, setQuery] = React.useState<string>("");
    const [results, setResults] = React.useState<Media[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const filtersFormRef = React.useRef<HTMLFormElement | null>(null);
    const sortByRef = React.useRef<HTMLSelectElement | null>(null);

    const [libraryEntryModalMapping, setLibraryEntryModalMapping] =
        React.useState<Mapping | null>(null);
    const [addToListModalMapping, setAddToListModalMapping] =
        React.useState<Mapping | null>(null);

    const search = async () => {
        setLoading(true);
        setError(null);

        let filters: { [key: string]: any } = {};

        Array.from(
            new FormData(
                filtersFormRef.current ? filtersFormRef.current : undefined
            ).entries()
        ).map(([key, value]) => {
            if (value == "") return;
            filters[key] = value == "on" ? true : value;
        });

        try {
            const results = await api.search(searchType, {
                query,
                sortBy: sortByRef.current?.value || null,
                ...filters,
            });
            setResults(results);
        } catch (e) {
            console.log(e);
            setError("Oops! An error occurred :/");
        }

        setLoading(false);
    };

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const delayedFunction = () => {
            if (query === "") return;
            search();
        };

        // Clear previous timeout and set a new one on query change
        if (timeoutId !== null) clearTimeout(timeoutId);
        if (query != "") setLoading(true);

        timeoutId = setTimeout(
            delayedFunction,
            api.config.search[searchType]?.typingDelay || 500
        );

        return () => {
            if (timeoutId !== null) clearTimeout(timeoutId);
        };
    }, [query]);

    React.useEffect(() => {
        setQuery("");
        setResults([]);
        setError(null);
        setLoading(false);
    }, [searchType]);

    const enabledSearchTypes = [
        ...(api?.config.search.anime ? ["anime"] : []),
        ...(api?.config.search.manga ? ["manga"] : []),
    ];

    return (
        <>
            <main className="flex flex-col min-h-full">
                <div className="flex flex-row items-stretch gap-4 flex-1 pr-4">
                    <div className="flex-1 flex flex-col border-r border-r-zinc-800">
                        <div className="flex flex-row items-center">
                            <VerticalNavSpacer />
                            <LeftNavSpacer />
                            <div className="flex flex-row gap-2 items-center">
                                {enabledSearchTypes.map((type) => (
                                    <Chip
                                        key={type}
                                        label={
                                            type.slice(0, 1).toUpperCase() +
                                            type.slice(1)
                                        }
                                        selected={searchType === type}
                                        onClick={() => {
                                            setSearchType(type as MediaType);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 border-b border-zinc-800 px-4 pb-2 mt-2">
                            <div className="flex flex-row gap-4 items-center">
                                <TextInput
                                    name="search"
                                    icon={
                                        <MagnifyingGlassIcon className="h-6 w-6" />
                                    }
                                    label={`Search in ${api.name}`}
                                    value={query}
                                    onChange={(e: any) =>
                                        setQuery(e.target.value)
                                    }
                                />
                                <div className="flex flex-row items-center rounded bg-zinc-800 overflow-hidden">
                                    <ToggleButton
                                        selected={displayMode == "list"}
                                        onClick={() => setDisplayMode("list")}
                                    >
                                        <Bars4Icon className="h-6 w-6" />
                                    </ToggleButton>
                                    <ToggleButton
                                        selected={displayMode == "grid"}
                                        onClick={() => setDisplayMode("grid")}
                                    >
                                        <Squares2X2Icon className="h-6 w-6" />
                                    </ToggleButton>
                                </div>
                            </div>
                            {api.config.search[searchType]?.sortBy && (
                                <div className="relative text-zinc-400 cursor-pointer transition hover:text-zinc-300 w-fit">
                                    <select
                                        className="bg-zinc-900 text-sm appearance-none pl-5 pr-2 outline-none cursor-pointer"
                                        ref={sortByRef}
                                        onChange={() => {
                                            search();
                                        }}
                                    >
                                        {api.config.search[
                                            searchType
                                        ]?.sortBy?.map((s: any) => (
                                            <option
                                                key={s.value}
                                                value={s.value}
                                                className="text-zinc-300"
                                            >
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronUpDownIcon className="h-4 w-4 absolute top-0 bottom-0 left-0 my-auto stroke-2 pointer-events-none" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <div
                                className={cn([
                                    "absolute top-0 bottom-0 left-0 right-0",
                                    styles.scrollable,
                                ])}
                            >
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="h-6 w-6 border-2 border-white/90 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : error ? (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                        (╯°□°）╯︵ ┻━┻
                                        <br />
                                        Oops, an error occurred!
                                    </div>
                                ) : results.length == 0 && query == "" ? (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                        (◕‿◕✿)
                                        <br />
                                        Start typing to search!
                                    </div>
                                ) : results.length == 0 ? (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                        (╥﹏╥)
                                        <br />
                                        Oops, No results for that query!
                                    </div>
                                ) : displayMode == "list" ? (
                                    <List
                                        results={results}
                                        openLibraryEntryModal={
                                            setLibraryEntryModalMapping
                                        }
                                        openAddToListModal={
                                            setAddToListModalMapping
                                        }
                                    />
                                ) : (
                                    <Grid
                                        results={results}
                                        openLibraryEntryModal={
                                            setLibraryEntryModalMapping
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <form
                        className="w-60 flex flex-col gap-4"
                        ref={filtersFormRef}
                    >
                        <VerticalNavSpacer />
                        <div className="text-lg font-medium -mt-3">Filters</div>
                        {api.config.search[searchType]?.filters.map(
                            (filter: any, index: number) => {
                                switch (filter.type) {
                                    case InputType.Select:
                                        return (
                                            <SelectFilter
                                                key={index}
                                                onChange={search}
                                                {...filter}
                                            />
                                        );

                                    case InputType.CheckboxInput:
                                        return (
                                            <CheckboxFilter
                                                key={index}
                                                onChange={search}
                                                {...filter}
                                            />
                                        );
                                }
                            }
                        )}
                    </form>
                </div>
            </main>
            <LibraryEntryModal
                mapping={libraryEntryModalMapping}
                closeModal={() => setLibraryEntryModalMapping(null)}
            />
            <AddToListModal
                mapping={addToListModalMapping || undefined}
                closeModal={() => setAddToListModalMapping(null)}
            />
        </>
    );
}

function Filter({ title, children }: { title: string; children: JSX.Element }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm text-zinc-400">{title}</div>
            {children}
        </div>
    );
}

function SelectFilter({
    name,
    label,
    icon,
    options,
    ...props
}: SelectInputInterface & { [key: string]: any }) {
    return (
        <Filter title={label}>
            <div className="relative">
                <select
                    defaultValue={options[0].value}
                    name={name}
                    {...props}
                    className="py-2 px-2 leading-none rounded outline-none bg-zinc-800 text-sm cursor-pointer appearance-none w-full"
                >
                    {options.map((v: any, i: number) => (
                        <option key={i} value={v.value} className="bg-zinc-800">
                            {v.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon className="h-4 w-4 stroke-2 pointer-events-none absolute top-0 bottom-0 right-2 my-auto" />
            </div>
        </Filter>
    );
}

function CheckboxFilter({
    name,
    label,
    defaultChecked,
    ...props
}: CheckboxGroupInterface & { [key: string]: any }) {
    const [checked, setChecked] = React.useState(defaultChecked);

    return (
        <label
            htmlFor={name}
            className="group flex flex-row items-center gap-2 cursor-pointer"
        >
            <input
                type="checkbox"
                name={name}
                id={name}
                checked={checked}
                onChange={() => {
                    setChecked((v) => !v);
                    props.onChange();
                }}
                className="hidden"
            />
            <div className="border border-zinc-700 group-hover:bg-zinc-700 h-4 w-4 rounded transition overflow-hidden">
                {checked == true && (
                    <div className="h-4 w-4 bg-zinc-100 text-zinc-950">
                        <CheckIcon className="w-4 h-4 p-0.5 stroke-[4px]" />
                    </div>
                )}
            </div>
            <div className="text-sm text-zinc-400 group-hover:text-zinc-100 leading-none transition">
                {label}
            </div>
        </label>
    );
}

function ToggleButton({
    children,
    selected,
    onClick,
}: {
    children: JSX.Element;
    selected: boolean;
    onClick: any;
}): JSX.Element {
    return (
        <button
            className={cn([
                "p-2 hover:bg-zinc-600 transition",
                ...(selected ? ["bg-zinc-700"] : []),
            ])}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function MediaCard({ media, onClick }: { media: Media; onClick: any }) {
    const libraryEntry = useLiveQuery(
        () => db.library.get({ mapping: media.mapping }),
        [media],
        {
            ...defaultLibraryEntry,
            type: media.type,
            mapping: media.mapping,
        }
    );

    const m = useMessages();

    return (
        <div
            className="w-full h-full rounded relative cursor-pointer flex flex-col gap-2 group"
            onClick={onClick}
        >
            <div className="relative">
                <img
                    src={media.imageUrl || undefined}
                    alt={getMediaTitle(media)}
                    className="w-full aspect-[2/3] object-cover object-center rounded"
                />
                <div className="opacity-0 group-hover:opacity-100 absolute top-0 bottom-0 left-0 right-0 bg-zinc-950/30 transition-all"></div>
                {libraryEntry?.favorite && (
                    <button className="rounded-full bg-zinc-950 absolute top-1 left-1 p-1">
                        <HeartIcon className="h-3 w-3 text-red-400 fill-red-400" />
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
                <div className="text-sm text-zinc-200 group-hover:text-white line-clamp-2 leading-tight transition">
                    {getMediaTitle(media)}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-1 mt-auto">
                    {[MediaRating.RPlus, MediaRating.Rx].includes(
                        // May be null/undefined but that's fine. The ! is just
                        // for type checking.
                        media.rating!
                    ) && (
                        <>
                            <span className="text-red-500">+18</span> —
                        </>
                    )}{" "}
                    {media.startDate?.getFullYear() || ""}{" "}
                    {m(`media_format_${media.format}` as keyof Messages)}{" "}
                    {media.genres.length > 0 &&
                        "— " +
                            media.genres
                                .map((genre: MediaGenre, index: number) => {
                                    const msg = m(
                                        `media_genre_${genre}` as keyof Messages
                                    );
                                    if (index === 0) {
                                        return (
                                            msg[0].toUpperCase() +
                                            msg.substring(1).toLowerCase()
                                        );
                                    } else {
                                        return msg.toLowerCase();
                                    }
                                })
                                .join(", ")}
                </div>
            </div>
        </div>
    );
}

function Grid({
    results,
    openLibraryEntryModal,
}: {
    results: Media[];
    openLibraryEntryModal: any;
}) {
    return (
        <div className="grid grid-cols-4 lg:grid-cols-6 relative gap-4 p-4">
            {results.map((media) => (
                <MediaCard
                    key={media.mapping}
                    media={media}
                    onClick={() => openLibraryEntryModal(media.mapping)}
                />
            ))}
        </div>
    );
}

function MediaRow({
    media,
    onClick,
    addToList,
}: {
    media: Media;
    onClick: any;
    addToList: any;
}) {
    const m = useMessages();
    const [titleLanguage] = useTitleLanguage();

    const libraryEntry = useLiveQuery(
        () => db.library.get({ mapping: media.mapping }),
        [media],
        {
            ...defaultLibraryEntry,
            type: media.type,
            mapping: media.mapping,
        }
    );

    return (
        <div className="flex flex-row items-center gap-4 rounded group transition py-2 px-2 cursor-pointer relative hover:bg-zinc-800">
            <img
                className="w-10 rounded aspect-square object-cover object-center"
                src={media.imageUrl || undefined}
                alt={getMediaTitle(media)}
            />
            <div className="flex flex-col justify-center flex-1">
                <div className="text-zinc-200 group-hover:text-white transition text-left line-clamp-1">
                    {getMediaTitle(media)}
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="text-xs text-zinc-400 line-clamp-1 text-left">
                        {[MediaRating.RPlus, MediaRating.Rx].includes(
                            // May be null/undefined but that's fine. The ! is just
                            // for type checking.
                            media.rating!
                        ) && (
                            <>
                                <span className="text-red-500">+18</span> —
                            </>
                        )}{" "}
                        {media.startDate?.getFullYear() || ""}{" "}
                        {m(`media_format_${media.format}` as keyof Messages) ||
                            ""}{" "}
                        {media.genres.length > 0 &&
                            "— " +
                                media.genres
                                    .map((genre: MediaGenre, index: number) => {
                                        const msg = m(
                                            `media_genre_${genre}` as keyof Messages
                                        );
                                        if (index === 0) {
                                            return (
                                                msg[0].toUpperCase() +
                                                msg.substring(1).toLowerCase()
                                            );
                                        } else {
                                            return msg.toLowerCase();
                                        }
                                    })
                                    .join(", ")}
                    </div>
                </div>
            </div>
            {/* There is a separate div to handle the clicks to prevent the
                modal from being opened when the buttons are clicked */}
            <div
                className="absolute top-0 bottom-0 left-0 right-0"
                onClick={onClick}
            ></div>
            <div className="opacity-0 group-hover:opacity-100 transition-all p-2 flex flex-row items-center gap-2 z-10">
                <div className="relative">
                    <select
                        className="text-xs py-1 pl-2 pr-6 rounded-full bg-zinc-700 transition hover:bg-zinc-600 appearance-none outline-none"
                        value={libraryEntry?.status || "not_started"}
                        onChange={(e) => {
                            db.library
                                .update(media.mapping, {
                                    status: e.target.value,
                                })
                                .then((updated) => {
                                    if (!updated) {
                                        db.library.add({
                                            ...defaultLibraryEntry,
                                            type: media.type,
                                            mapping: media.mapping,
                                            status: e.target
                                                .value as LibraryStatus,
                                        });
                                    }
                                });
                        }}
                    >
                        <option className="bg-zinc-700" value="not_started">
                            Not {media.type == "anime" ? "watched" : "read"}
                        </option>
                        <option className="bg-zinc-700" value="planned">
                            Planned
                        </option>
                        <option className="bg-zinc-700" value="in_progress">
                            {media.type == "anime" ? "Watching" : "Reading"}
                        </option>
                        <option className="bg-zinc-700" value="paused">
                            Paused
                        </option>
                        <option className="bg-zinc-700" value="dropped">
                            Dropped
                        </option>
                        <option className="bg-zinc-700" value="completed">
                            Completed
                        </option>
                    </select>
                    <ChevronDownIcon className="h-3 w-3 stroke-2 absolute top-0 bottom-0 right-2 my-auto pointer-events-none" />
                </div>
                <button
                    className="rounded-full bg-zinc-700 p-1 transition hover:bg-zinc-600"
                    onClick={() => {
                        db.library
                            .update(media.mapping, {
                                favorite: !libraryEntry?.favorite,
                            })
                            .then((updated) => {
                                if (!updated) {
                                    db.library
                                        .add({
                                            ...defaultLibraryEntry,
                                            type: media.type,
                                            mapping: media.mapping,
                                            favorite: true,
                                        })
                                        .then((value) => {});
                                }
                            });
                    }}
                >
                    <HeartIcon
                        className={`w-4 h-4 stroke-2 ${
                            libraryEntry?.favorite
                                ? "text-red-400 fill-red-400"
                                : ""
                        }`}
                    />
                </button>
                <button
                    className="rounded-full bg-zinc-700 p-1 transition hover:bg-zinc-600"
                    onClick={addToList}
                >
                    <PlusIcon className="w-4 h-4 stroke-2" />
                </button>
            </div>
        </div>
    );
}

function List({
    results,
    openLibraryEntryModal,
    openAddToListModal,
}: {
    results: Media[];
    openLibraryEntryModal: (mapping: Mapping) => void;
    openAddToListModal: (mapping: Mapping) => void;
}) {
    return (
        <div className="flex flex-col p-2">
            {results.map((result) => (
                <MediaRow
                    key={result.mapping}
                    media={result}
                    onClick={() => openLibraryEntryModal(result.mapping)}
                    addToList={() => openAddToListModal(result.mapping)}
                />
            ))}
        </div>
    );
}
