import { motion, AnimatePresence } from "framer-motion";

import { useLiveQuery } from "dexie-react-hooks";

import { XMarkIcon } from "@heroicons/react/24/outline";

import { Mapping, MediaType } from "@/lib/types";
import { db } from "@/lib/db";

export default function LibraryEntryModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping | null;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {mapping && <Modal mapping={mapping} closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function Modal({
    mapping,
    closeModal,
}: {
    mapping: Mapping;
    closeModal: () => void;
}) {
    const libraryEntry = useLiveQuery(() => db.library.get({ mapping }));
    const mediaCache = useLiveQuery(() => db.mediaCache.get({ mapping }));

    const mediaType = mapping.split(":")[1] as MediaType;

    if (!mediaCache) return null;

    return (
        <motion.div
            className="fixed top-0 bottom-0 left-0 right-0 bg-zinc-950/50 flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className="absolute top-0 bottom-0 left-0 right-0"
                onClick={closeModal}
            ></div>
            <motion.div
                className="w-full max-w-3xl bg-zinc-800 relative"
                initial={{
                    translateY: 10,
                }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 10 }}
                transition={{ duration: 0.2 }}
            >
                <div
                    className="h-40 bg-center bg-cover opacity-40 absolute top-0 bottom-0 left-0 right-0"
                    style={{
                        backgroundImage: `url(${
                            mediaCache.bannerUrl || mediaCache.imageUrl
                        })`,
                    }}
                ></div>
                <div className="flex flex-row px-8 py-4 gap-4 relative h-40 items-end">
                    <button
                        className="p-2 rounded-full absolute top-2 right-2"
                        onClick={closeModal}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <img
                        className="w-24 aspect-cover rounded -mb-8 object-cover object-center"
                        src={mediaCache.imageUrl!}
                    />
                    <div className="text-lg">{mediaCache.title}</div>
                </div>
                <div className="p-8 pt-12 grid grid-cols-3 gap-8 relative">
                    <div className="w-full">
                        <span className="text-xs text-zinc-400">Status</span>
                        <select className="rounded p-2 leading-none bg-zinc-900 w-full cursor-pointer text-sm outline-none">
                            <option value="not_started">
                                Not {mediaType == "anime" ? "watched" : "read"}
                            </option>
                        </select>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
