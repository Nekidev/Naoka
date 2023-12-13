import { Mapping } from "@/lib/types";
import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { List, db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { RectangleStackIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    const lists = useLiveQuery(() => db.lists.toArray());

    return (
        <Modal closeModal={closeModal}>
            <div className="w-screen max-w-sm bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto">
                <div className="p-4 flex flex-col gap-4 border-b border-zinc-700">
                    <div className="flex flex-row items-center justify-between">
                        <h1 className="leading-none text-xl">Add to list</h1>
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
                                {media?.type === "anime" ? "Anime" : "Manga"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-2 overflow-y-auto relative">
                    {lists?.map((list) => (
                        <List key={list.id} list={list} mapping={mapping} />
                    ))}
                </div>
            </div>
        </Modal>
    );
}

function List({ list, mapping }: { list: List; mapping: Mapping }) {
    return (
        <button className="flex flex-row items-center gap-2 p-2 rounded hover:bg-zinc-700 group transition w-full">
            <div className="rounded h-10 w-10 bg-zinc-700 flex flex-col items-center justify-center group-hover:bg-zinc-600 transition">
                <RectangleStackIcon className="h-5 w-5 text-zinc-500 stroke-2" />
            </div>
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
