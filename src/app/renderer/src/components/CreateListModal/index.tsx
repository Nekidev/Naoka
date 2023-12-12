import { db } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export default function CreateListModal({
    isOpen,
    closeModal,
}: {
    isOpen: boolean;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {isOpen && <Modal closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function Modal({ closeModal }: { closeModal: () => void }) {
    const [title, setTitle] = React.useState("");

    async function createList() {
        if (!title || title.trim().length < 1) return;

        const listId = await db.lists.add({
            name: title.trim(),
            items: [],
            syncedProviders: [],
            updatedAt: new Date(),
            createdAt: new Date(),
            accessedAt: new Date(),
        })

        return listId
    }

    return (
        <>
            <motion.div
                className="fixed top-0 bottom-0 left-0 right-0 bg-zinc-950/50 flex flex-col items-center justify-center p-8 z-30"
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
                    className="w-full max-w-lg bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-4"
                    initial={{
                        translateY: 10,
                    }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="text-xl leading-none">Create a list</h2>
                    <input
                        type="text"
                        className="w-full border border-zinc-900 rounded bg-zinc-900 p-2 leading-none outline-none placeholder:text-zinc-400 focus:border-zinc-100 transition"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                    />
                    <div className="flex flex-row items-center gap-2 justify-end">
                        <button
                            className="py-2 px-4 leading-none rounded transition text-zinc-300 bg-zinc-700 hover:bg-zinc-600"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            className="py-2 px-4 leading-none rounded transition text-zinc-900 bg-zinc-100 hover:bg-zinc-300 disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:cursor-not-allowed"
                            disabled={title.trim() == ""}
                            onClick={() => {
                                createList().then((listId) => {
                                    closeModal();
                                })
                            }}
                        >
                            Create
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}
