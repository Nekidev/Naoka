"use client";

import React from "react";
import NavigationBarContext from "@/contexts/NavigationBarContext";
import { TextInput as TextInputInterface } from "@/lib";
import getAPI from "@/lib/api";
import { cn } from "@/utils";

export default function Search() {
    const { extraComponent, setExtraComponent } =
        React.useContext(NavigationBarContext);

    const [searchType, setSearchType] = React.useState<
        "anime" | "manga" | "characters" | "people"
    >("anime");

    const api = getAPI("mal");

    React.useEffect(() => {
        setExtraComponent(
            <div className="flex flex-row gap-2 items-center">
                {api?.config.search.anime !== undefined && (
                    <Chip
                        label="Anime"
                        code={searchType}
                        setCode={setSearchType}
                    />
                )}
                {api?.config.search.manga !== undefined && (
                    <Chip
                        label="Manga"
                        code={searchType}
                        setCode={setSearchType}
                    />
                )}
                {api?.config.search.characters !== undefined && (
                    <Chip
                        label="Characters"
                        code={searchType}
                        setCode={setSearchType}
                    />
                )}
                {api?.config.search.people !== undefined && (
                    <Chip
                        label="People"
                        code={searchType}
                        setCode={setSearchType}
                    />
                )}
            </div>
        );

        return () => {
            setExtraComponent(<></>);
        };
    }, []);

    return (
        <main className="p-4">
            <div className="flex flex-row items-center">
                {api?.config.search[searchType]?.components.map(
                    (component, index) => {
                        switch (component.type) {
                            case "text":
                                return (
                                    <TextInput
                                        {...component.value}
                                        key={index}
                                    />
                                );
                        }
                    }
                )}
            </div>
        </main>
    );
}

function Chip({
    label,
    code,
    setSelectedCode,
    selectedCode
}: {
    label: string;
    code: number;
    setSelectedCode: (value: number) => void;
    selectedCode: number;
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

function Chips(labels: string[]) {
    const [selected, setSelected] = React.useState(0);

    return (
        <div className="flex flex-row gap-2">
            {labels.map((label, index) => {
                return <Chip label={label} code={index} selectedCode={selected} setSelectedCode={setSelected} />;
            })}
        </div>
    );
}

function TextInput({ name, icon, label }: TextInputInterface) {
    return (
        <div className="relative flex-1">
            <input
                type="text"
                name={name}
                placeholder={label}
                className={cn([
                    "p-2 leading-none rounded bg-zinc-950 outline-none border",
                    "border-transparent focus:border-white transition placeholder:text-zinc-400",
                    "text-white/90 w-full",
                ])}
            />
        </div>
    );
}
