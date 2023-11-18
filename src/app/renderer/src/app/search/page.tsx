"use client";

import React from "react";
import {
    MagnifyingGlassIcon,
    Bars4Icon,
    Squares2X2Icon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";
import { VerticalNavSpacer, LeftNavSpacer } from "@/components/NavigationBar";
import { Media, TextInput as TextInputInterface } from "@/lib";
import getAPI from "@/lib/api";
import { cn } from "@/utils";
import styles from "./styles.module.css";

export default function Search() {
    const [searchType, setSearchType] = React.useState<
        "anime" | "manga" | "characters" | "people"
    >("anime");

    const api = getAPI("myanimelist");

    const [displayMode, setDisplayMode] = React.useState<"list" | "grid">(
        "list"
    );
    const [query, setQuery] = React.useState<string>("");
    const [results, setResults] = React.useState<Media[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const delayedFunction = () => {
            if (query === "") return;

            (async () => {
                setLoading(true);
                setError(null);

                const [res, error] = await api.search({ query }, searchType);

                if (error) {
                    setError("Oops! An error occurred :/");
                } else {
                    setResults(res);
                }

                setLoading(false);
            })();
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

    const enabledSearchTypes = [
        ...(api?.config.search.anime ? ["anime"] : []),
        ...(api?.config.search.manga ? ["manga"] : []),
        ...(api?.config.search.characters ? ["characters"] : []),
        ...(api?.config.search.people ? ["people"] : []),
    ];

    return (
        <main className="flex flex-col min-h-full">
            <div className="flex flex-row items-center">
                <VerticalNavSpacer />
                <LeftNavSpacer />
                <div className="flex flex-row gap-2 items-center">
                    {enabledSearchTypes.map((type) => (
                        <Chip
                            key={type}
                            label={
                                type.slice(0, 1).toUpperCase() + type.slice(1)
                            }
                            code={type}
                            selectedCode={searchType}
                            setSelectedCode={setSearchType}
                        />
                    ))}
                </div>
            </div>
            <div className="px-4 pt-2 flex flex-row items-stretch gap-4 flex-1">
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-row gap-4 items-center">
                        <TextInput
                            name="search"
                            icon={<MagnifyingGlassIcon className="h-6 w-6" />}
                            label={`Search in ${api.title}`}
                            value={query}
                            onChange={(e: any) => setQuery(e.target.value)}
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
                    <div className="flex-1 relative">
                        <div
                            className={cn([
                                "absolute top-0 bottom-0 left-0 right-0 pb-4",
                                styles.scrollable,
                            ])}
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="h-6 w-6 border-2 border-white/90 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : error ? (
                                error
                            ) : results.length == 0 && query == "" ? (
                                <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                    (◕‿◕✿)<br />
                                    Start typing to search!
                                </div>
                            ) : results.length == 0 ? (
                                <div className="h-full w-full flex flex-col items-center justify-center text-center">
                                    (╯°□°）╯︵ ┻━┻<br />
                                    Oops, No results for that query!
                                </div>
                            ) : displayMode == "list" ? (
                                <List results={results} />
                            ) : (
                                <Grid results={results} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-px bg-zinc-800"></div>
                <div className="w-60">
                    <div className="text-lg font-medium">Filters</div>
                </div>
            </div>
        </main>
    );
}

function Chip({
    label,
    code,
    selectedCode,
    setSelectedCode,
}: {
    label: string;
    code: string;
    selectedCode: string;
    setSelectedCode: any;
}) {
    return (
        <button
            className={
                "text-sm leading-none py-2 px-4 rounded-full transition " +
                (code === selectedCode
                    ? "bg-zinc-100 hover:bg-zinc-300 text-zinc-900"
                    : "bg-zinc-800 hover:bg-zinc-700")
            }
            onClick={() => {
                setSelectedCode(code);
            }}
        >
            {label}
        </button>
    );
}

function TextInput({
    name,
    icon,
    label,
    ...props
}: TextInputInterface & { [key: string]: any }) {
    return (
        <div className="relative flex-1">
            {icon && (
                <div className="absolute top-0 bottom-0 left-2 my-auto h-fit">
                    {icon}
                </div>
            )}
            <input
                type="text"
                name={name}
                placeholder={label}
                className={cn([
                    "p-2 py-2.5 leading-none rounded bg-zinc-800 outline-none border",
                    "border-transparent focus:border-white transition placeholder:text-zinc-400",
                    "text-white/90 w-full",
                    ...(icon ? ["pl-10"] : []),
                ])}
                {...props}
            />
        </div>
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

function MediaCard({ media }: { media: Media }) {
    return (
        <button className="w-full rounded overflow-hidden relative">
            <img
                src={media.imageUrl}
                alt={media.title}
                className="h-full w-full aspect-[2/3] object-cover object-center"
            />
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-zinc-950/70 p-2 flex flex-col justify-between opacity-0 hover:opacity-100 backdrop-blur-0 hover:backdrop-blur-sm transition-all">
                <div>
                    <div className="text-white/80 text-sm text-left line-clamp-4">
                        {media.title}
                    </div>
                </div>
                <div className="text-xs font-bold p-1 leading-none rounded bg-white/90 text-black">
                    {media.format.toUpperCase()}
                </div>
            </div>
        </button>
    );
}

function Grid({ results }: { results: Media[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 relative gap-4">
            {results.map((media) => (
                <MediaCard key={media.id} media={media} />
            ))}
        </div>
    );
}

function MediaRow({ media }: { media: Media }) {
    return (
        <button className="flex flex-row items-center gap-4 rounded group transition hover:drop-shadow-md py-2">
            <img
                className="w-10 rounded aspect-[2/3] object-cover object-center"
                src={media.imageUrl}
                alt={media.title}
            />
            <div className="flex flex-col justify-center gap-1 flex-1">
                <div className="text-white/80 group-hover:text-white transition text-left -mt-0.5">
                    {media.title}
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="text-zinc-950 text-xs font-bold leading-none bg-white/80 p-1 rounded w-fit uppercase">
                        {media.format}
                    </div>
                    <div className="text-xs text-white/70">
                        {media.genres.join(", ")}
                    </div>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all p-2">
                <ArrowRightIcon className="w-5 h-5 text-white/90" />
            </div>
        </button>
    );
}

function List({ results }: { results: Media[] }) {
    return (
        <div className="flex flex-col -my-2">
            {results.map((result) => (
                <MediaRow key={result.id} media={result} />
            ))}
        </div>
    );
}
