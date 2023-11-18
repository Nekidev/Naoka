"use client";

import React from "react";
import {
    MagnifyingGlassIcon,
    Bars4Icon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { VerticalNavSpacer, LeftNavSpacer } from "@/components/NavigationBar";
import { Anime, TextInput as TextInputInterface } from "@/lib";
import getAPI from "@/lib/api";
import { cn } from "@/utils";

export default function Search() {
    const [searchType, setSearchType] = React.useState<
        "anime" | "manga" | "characters" | "people"
    >("anime");

    const api = getAPI("myanimelist");

    const [displayMode, setDisplayMode] = React.useState<"list" | "grid">(
        "list"
    );
    const [query, setQuery] = React.useState<string>("");

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
            <div className="p-4 pt-2 flex flex-row items-stretch gap-4 flex-1">
                <div className="flex-1">
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

function AnimeRow({ anime }: { anime: Anime }) {
    return <div className=""></div>;
}
