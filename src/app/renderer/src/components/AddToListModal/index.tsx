import { Mapping } from "@/lib/types";
import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { List, MediaCache, db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { RectangleStackIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CreateListModal from "../CreateListModal";
import React from "react";

export default function AddToListModal({
    mapping,
    closeModal,
}: {
    mapping?: Mapping;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {mapping && <FormModal mapping={mapping} closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function FormModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping;
    closeModal: () => void;
}) {
    const media = useLiveQuery(() => db.mediaCache.get({ mapping }), [mapping]);
    const lists = useLiveQuery(() =>
        db.lists.toArray(async (lists) => {
            let itemCacheMappings: Array<Mapping> = [];

            for (const list of lists) {
                list.items.map((mapping: Mapping) =>
                    itemCacheMappings.push(mapping)
                );
            }

            const itemCaches: MediaCache[] = (await db.mediaCache.bulkGet([
                ...new Set(itemCacheMappings),
            ])) as MediaCache[];

            return lists.map((list) => {
                list.itemCaches = itemCaches.filter((v) =>
                    list.items.includes(v!.mapping)
                );
                return list;
            });
        })
    );

    const [isCreateListModalOpen, setIsCreateListModalOpen] =
        React.useState(false);

    return (
        <>
            <Modal closeModal={closeModal}>
                <div className="w-screen max-w-sm max-h-[calc(100vh-4rem)] bg-zinc-800 relative rounded overflow-hidden flex flex-col">
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="leading-none text-xl">
                                Add to list
                            </h1>
                            <button className="p-2 -m-2" onClick={closeModal}>
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <img
                                src={media?.imageUrl || undefined}
                                className="w-10 h-10 rounded object-center object-cover"
                            />
                            <div className="flex-1 flex flex-col items-start justify-center gap-1">
                                <div className="leading-none line-clamp-1 text-zinc-300">
                                    {media?.title}
                                </div>
                                <div className="leading-none text-sm text-zinc-400">
                                    {media?.type === "anime"
                                        ? "Anime"
                                        : "Manga"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {lists ? (
                        lists.length > 0 ? (
                            <div className="p-2 overflow-y-auto shrink flex flex-col justify-stretch border-y border-zinc-700">
                                {lists.map((list) => (
                                    <List
                                        key={list.id}
                                        list={list}
                                        mapping={mapping}
                                        closeModal={closeModal}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 flex flex-col justify-center items-center text-zinc-300 border-y border-zinc-700 text-sm">
                                <div className="mb-1">(⩾﹏⩽)</div>
                                <div>There's nothing here!</div>
                                <div className="opacity-50 text-xs">
                                    (You can create a new list below!)
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex p-6 items-center justify-center border-y border-zinc-700">
                            <div className="h-6 w-6 border-2 border-zinc-100 border-t-transparent animate-spin rounded-full"></div>
                        </div>
                    )}
                    <div className="flex flex-col items-stretch gap-2 p-4">
                        <button
                            className="p-2 rounded text-center leading-none text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition"
                            onClick={() => setIsCreateListModalOpen(true)}
                        >
                            Create new list
                        </button>
                    </div>
                </div>
            </Modal>
            <CreateListModal
                isOpen={isCreateListModalOpen}
                closeModal={() => setIsCreateListModalOpen(false)}
            />
        </>
    );
}

function List({
    list,
    mapping,
    closeModal,
}: {
    list: List;
    mapping: Mapping;
    closeModal: () => void;
}) {
    return (
        <button
            className="flex flex-row items-center gap-2 p-2 rounded hover:bg-zinc-700 disabled:hover:bg-transparent group transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={list.items.includes(mapping)}
            onClick={async () => {
                if (list.items.includes(mapping)) return;

                await db.lists
                    .where("id")
                    .equals(list.id!)
                    .modify({ items: [...list.items, mapping] });
                closeModal();
            }}
        >
            {list.items.length < 2 ? (
                <div className="rounded h-10 w-10 bg-zinc-700 flex flex-col items-center justify-center group-hover:bg-zinc-600 group-disabled:group-hover:bg-zinc-700 transition">
                    <RectangleStackIcon className="h-5 w-5 text-zinc-500 stroke-2" />
                </div>
            ) : (
                <div className="rounded h-10 w-10 bg-zinc-700 relative">
                    <img src={list.itemCaches![0].imageUrl!} className="rounded absolute top-0 left-0 bottom-0 aspect-cover h-full object-center object-cover z-10" />
                    <img src={list.itemCaches![1].imageUrl!} className="rounded absolute top-0 right-0 bottom-0 aspect-cover h-full object-center object-cover" />
                </div>
            )}
            <div className="flex-1 flex flex-col items-start justify-center gap-1">
                <div className="leading-none line-clamp-1 text-zinc-300">
                    {list.name}
                </div>
                {list.items.includes(mapping) && (
                    <div className="leading-none text-sm text-zinc-400">
                        Already in this list
                    </div>
                )}
            </div>
        </button>
    );
}
