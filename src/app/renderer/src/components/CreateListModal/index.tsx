import { db } from "@/lib/db";
import { allTrim } from "@/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import Modal from "../Modal";

export default function CreateListModal({
    isOpen,
    closeModal,
}: {
    isOpen: boolean;
    closeModal: () => void;
}) {
    const [title, setTitle] = React.useState("");
    const listsWithSameTitle = useLiveQuery(
        () =>
            db.lists
                .filter(
                    ({ name }) =>
                        allTrim(name.toLowerCase()) ==
                        allTrim(title.toLowerCase())
                )
                .count(),
        [title]
    );

    async function createList() {
        if (!title || title.trim().length < 1) return;

        const listId = await db.lists.add({
            name: title.trim(),
            items: [],
            syncedProviders: [],
            updatedAt: new Date(),
            createdAt: new Date(),
            accessedAt: new Date(),
        });

        return listId;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <Modal closeModal={closeModal}>
                    <div className="w-screen max-w-lg bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-4">
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
                        <AnimatePresence>
                            {!!listsWithSameTitle && listsWithSameTitle > 0 && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        height: 0,
                                        marginTop: "-1rem",
                                    }}
                                    animate={{
                                        opacity: 1,
                                        height: "1rem",
                                        marginTop: "-0.5rem",
                                    }}
                                    exit={{
                                        opacity: 0,
                                        height: 0,
                                        marginTop: "-1rem",
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="text-yellow-500 text-sm -mt-2 flex flex-row gap-1 leading-none"
                                >
                                    <ExclamationTriangleIcon className="h-3 w-3 mt-px" />
                                    Warning! A list with that name already
                                    exists.
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                    });
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
}
