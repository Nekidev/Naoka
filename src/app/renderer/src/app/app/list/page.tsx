"use client";

import EditListModal from "@/components/EditListModal";
import LibraryEntryModal from "@/components/LibraryEntryModal";
import { LeftNavSpacer, VerticalNavSpacer } from "@/components/NavigationBar";
import { List, Media, db } from "@/lib/db";
import { Mapping, MediaType } from "@/lib/types";
import {
    PencilIcon,
    RectangleStackIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLiveQuery } from "dexie-react-hooks";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ConfirmModal";

interface ListWithMedia extends List {
    media?: Media[];
}

export default function List() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = searchParams.get("id");

    const list = useLiveQuery(
        () =>
            db.lists.get(parseInt(id!)).then(async (list: List | undefined) => {
                if (!list) {
                    notFound();
                }

                let media = await db.media.bulkGet([...list!.items]);

                return {
                    ...list,
                    media: media || [],
                } as ListWithMedia;
            }),
        [id]
    );

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [libraryEntryModalMapping, setLibraryEntryModalMapping] =
        React.useState<Mapping | null>(null);

    const mainRef = React.useRef<any>(null);
    const [scrollY, setScrollY] = React.useState(0);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

    React.useEffect(() => {
        function handleScroll(e: any) {
            setScrollY(e.target.scrollTop);
        }

        if (mainRef.current) {
            mainRef.current.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (mainRef.current) {
                mainRef.current.removeEventListener("scroll", handleScroll);
            }
        };
    });

    if (!list) {
        return (
            <main className="h-full flex flex-col items-center justify-center">
                <div className="h-6 w-6 border-2 border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
            </main>
        );
    }

    function countItemsByMedia(mediaType: MediaType) {
        return list!.media!.filter(
            (v: Media | undefined) => v!.type === mediaType
        ).length;
    }

    return (
        <>
            <main
                className="flex flex-col min-h-full max-h-full overflow-y-auto"
                ref={mainRef}
            >
                <div
                    className={
                        "sticky top-0 shrink-0 bg-zinc-900 z-20 border-b-zinc-800"
                    }
                    style={{
                        borderBottomWidth: scrollY > 112 ? 1 : 0,
                    }}
                >
                    <div className="flex flex-row items-center">
                        <VerticalNavSpacer />
                        <LeftNavSpacer />
                        <AnimatePresence>
                            {scrollY > 112 && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        translateY: 5,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        translateY: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        translateY: 5,
                                    }}
                                    transition={{ duration: 0.15 }}
                                    className="flex flex-row items-center gap-2"
                                >
                                    <div className="py-1 px-2 rounded bg-zinc-800 leading-none">
                                        List
                                    </div>
                                    <div className="line-clamp-1 leading-none">
                                        {list.name}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="p-4 flex flex-row items-center justify-between gap-8 border-b border-zinc-800">
                    <div className="flex flex-row items-center gap-4">
                        {list.items.length < 2 ? (
                            <div className="h-20 w-20 rounded bg-zinc-700 flex flex-col items-center justify-center shrink-0">
                                <RectangleStackIcon className="h-8 w-8 text-zinc-400" />
                            </div>
                        ) : (
                            <div className="h-20 w-20 rounded bg-zinc-700 relative">
                                <img
                                    src={
                                        list.media![0].imageUrl ||
                                        undefined
                                    }
                                    className="absolute top-0 bottom-0 left-0 h-full rounded aspect-cover object-cover object-center z-10"
                                />
                                <img
                                    src={
                                        list.media![1].imageUrl ||
                                        undefined
                                    }
                                    className="absolute top-0 bottom-0 right-0 h-full rounded aspect-cover object-cover object-center"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="text-3xl line-clamp-1">
                                {list.name}
                            </h1>
                            <div className="text-zinc-400">
                                {countItemsByMedia("anime")} animes,{" "}
                                {countItemsByMedia("manga")} mangas
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <button
                            className="p-2 rounded bg-zinc-700 hover:bg-zinc-600 transition text-zinc-200 leading-none"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <PencilIcon className="h-4 w-4 stroke-2" />
                        </button>
                        <button
                            className="p-2 rounded bg-zinc-700 hover:bg-red-400 transition text-zinc-200 leading-none"
                            onClick={() => {
                                setIsConfirmModalOpen(true);
                            }}
                        >
                            <TrashIcon className="h-4 w-4 stroke-2" />
                        </button>
                    </div>
                </div>
                {list.items.length > 0 ? (
                    <div className="p-2 gap-x-4 grid grid-cols-3 relative">
                        {list.media!.map((item: Media) => (
                            <MediaItem
                                list={list}
                                media={item}
                                openLibraryEntryModal={
                                    setLibraryEntryModalMapping
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-zinc-300">
                        <div className="mb-2">(╥﹏╥)</div>
                        <div>Where's everyone?</div>
                        <div className="opacity-50 text-xs">
                            Add some items to the list to see them here!
                        </div>
                    </div>
                )}
            </main>
            <EditListModal
                list={isEditModalOpen ? list : undefined}
                closeModal={() => setIsEditModalOpen(false)}
            />
            <LibraryEntryModal
                mapping={libraryEntryModalMapping}
                closeModal={() => {
                    setLibraryEntryModalMapping(null);
                }}
            />
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Delete this list"
                content="Are you sure you want to delete this list? This action cannot be undone."
                onConfirm={() => {
                    setIsConfirmModalOpen(false);
                    router.replace("/library");
                    setTimeout(
                        () => db.lists.where("id").equals(list.id!).delete(),
                        300
                    );
                }}
                onDecline={() => {
                    setIsConfirmModalOpen(false);
                }}
                closeModal={() => {
                    setIsConfirmModalOpen(false);
                }}
            />
        </>
    );
}

function MediaItem({
    list,
    media,
    openLibraryEntryModal,
}: {
    list: List;
    media: Media;
    openLibraryEntryModal: any;
}) {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

    return (
        <>
            <div className="w-full p-2 rounded flex flex-row items-center gap-2 hover:bg-zinc-800 transition cursor-pointer group relative">
                <img
                    src={media.imageUrl || undefined}
                    className="h-10 w-10 rounded object-cover object-center"
                />
                <div className="flex flex-col flex-1 gap-1">
                    <div className="line-clamp-1 leading-none text-zinc-300">
                        {media.title.romaji}
                    </div>
                    <div className="text-sm text-zinc-400 leading-none">
                        {media.type == "anime" ? "Anime" : "Manga"}
                    </div>
                </div>
                <div
                    className="absolute top-0 bottom-0 left-0 right-0"
                    onClick={() => {
                        openLibraryEntryModal(media.mapping);
                    }}
                ></div>
                <button
                    className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition z-10"
                    onClick={() => {
                        setIsConfirmModalOpen(true);
                    }}
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Remove from this list"
                content={`Do you want to remove '${media.title}' from the list?`}
                onConfirm={async () => {
                    await db.lists.update(list.id!, {
                        items: list.items.filter(
                            (v: string) => v != media.mapping
                        ),
                    });
                }}
                closeModal={() => {
                    setIsConfirmModalOpen(false);
                }}
            />
        </>
    );
}
