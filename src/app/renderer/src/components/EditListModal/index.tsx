import { db } from "@/lib/db";
import { allTrim } from "@/lib/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import Modal from "../Modal";
import { List } from "@/lib/db/types";

export default function EditListModal({
    list,
    closeModal,
}: {
    list?: List;
    closeModal: () => void;
}) {
    const [name, setName] = React.useState(list?.name || "");

    const listsWithSameName = useLiveQuery(
        () =>
            db.lists
                .filter(
                    ({ name: listName }) =>
                        allTrim(listName.toLowerCase()) ==
                            allTrim(name.toLowerCase()) &&
                        allTrim(listName) != allTrim(list?.name || "")
                )
                .count(),
        [name]
    );

    React.useEffect(() => {
        setName(list?.name || "");
    }, [list]);

    async function updateList() {
        if (list) {
            await db.lists.update(list.id!, {
                name,
            });
        }
    }

    return (
        <AnimatePresence>
            {list && (
                <Modal closeModal={closeModal}>
                    <div className="w-screen max-w-lg bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-4">
                        <h2 className="text-xl leading-none p-4 -m-4 mb-0 border-b border-zinc-700">
                            Update{" "}
                            <span className="py-1 px-2 -my-1 rounded bg-zinc-700">
                                {list?.name}
                            </span>
                        </h2>
                        <form
                            className="w-full"
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateList().then(() => {
                                    closeModal();
                                });
                            }}
                            autoComplete="off"
                        >
                            <label className="text-sm leading-none mb-1 text-zinc-300">
                                Name
                            </label>
                            <input
                                type="text"
                                className="w-full border border-zinc-900 rounded bg-zinc-900 p-2 leading-none outline-none placeholder:text-zinc-400 focus:border-zinc-100 transition"
                                placeholder="Name"
                                autoComplete="off"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                            />
                        </form>
                        <AnimatePresence>
                            {!!listsWithSameName && listsWithSameName > 0 && (
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
                                Discard
                            </button>
                            <button
                                className="py-2 px-4 leading-none rounded transition text-zinc-900 bg-zinc-100 hover:bg-zinc-300 disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:cursor-not-allowed"
                                disabled={name.trim() == ""}
                                onClick={() => {
                                    updateList().then(() => {
                                        closeModal();
                                    });
                                }}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
}
