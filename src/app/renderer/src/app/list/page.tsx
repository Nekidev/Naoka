"use client";

import { LeftNavSpacer, VerticalNavSpacer } from "@/components/NavigationBar";
import { List, db } from "@/lib/db";
import { Mapping, MediaType } from "@/lib/types";
import { PencilIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { useLiveQuery } from "dexie-react-hooks";
import { useSearchParams } from "next/navigation";

export default function List() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const list = useLiveQuery(() => db.lists.get(parseInt(id!)), [id]);

    if (!list) {
        return (
            <main className="h-full flex flex-col items-center justify-center">
                <div className="h-6 w-6 border-2 border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
            </main>
        );
    }

    function countItemsByMedia(mediaType: MediaType) {
        return list!.items.filter((v: Mapping) => v.split(":")[1] === mediaType).length;
    }

    return (
        <main className="flex flex-col min-h-full max-h-full overflow-y-auto">
            <div className="sticky top-0 shrink-0 bg-zinc-900 z-10">
                <div className="flex flex-row items-center">
                    <VerticalNavSpacer />
                    <LeftNavSpacer />
                </div>
            </div>
            <div className="p-4 flex flex-row items-center justify-between border-b border-zinc-800">
                <div className="flex flex-row items-center gap-4">
                    <div className="h-20 w-20 rounded bg-zinc-700 flex flex-col items-center justify-center">
                        <RectangleStackIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <h1 className="text-3xl line-clamp-2">{list.name}</h1>
                        <div className="text-zinc-400">
                            {countItemsByMedia("anime")} animes, {countItemsByMedia("manga")} mangas
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <button className="p-2 rounded bg-zinc-700 hover:bg-zinc-600 transition text-zinc-200 leading-none flex flex-row items-center gap-4">
                        <PencilIcon className="h-4 w-4 stroke-2" />
                    </button>
                </div>
            </div>
        </main>
    );
}
