"use client";

import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { CloudIcon, PaintBrushIcon } from "@heroicons/react/24/outline";
import React from "react";

import Connections from "./tabs/connections";
import Appearance from "./tabs/appearance";
import { useMessages } from "@/lib/messages";

export default function SettingsModal({
    isOpen,
    closeModal,
}: {
    isOpen: boolean;
    closeModal: () => void;
}) {
    const [tab, setTab] = React.useState("appearance");
    const m = useMessages();

    return (
        <AnimatePresence>
            {isOpen && (
                <Modal closeModal={closeModal}>
                    <div className="rounded bg-zinc-800 w-[calc(100vw-8rem)] max-w-4xl overflow-x-hidden overflow-y-auto flex flex-row items-stretch border border-zinc-800 h-96">
                        <div className="p-2 w-60 bg-zinc-900 flex flex-col items-stretch sticky top-0 left-0 bottom-0 overflow-y-auto">
                            <Tab
                                label={m("settings_appearance_title")}
                                icon={<PaintBrushIcon className="h-6 w-6" />}
                                active={tab === "appearance"}
                                onClick={() => setTab("appearance")}
                            />
                            <Tab
                                label={m("settings_connections_title")}
                                icon={<CloudIcon className="h-6 w-6" />}
                                active={tab === "connections"}
                                onClick={() => setTab("connections")}
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 flex flex-col flex-1 gap-6 min-h-max">
                                {tab == "appearance" ? (
                                    <Appearance />
                                ) : tab == "connections" ? (
                                    <Connections />
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
}

function Tab({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`p-2 rounded hover:bg-zinc-700 leading-none flex flex-row items-center gap-4 transition ${
                active && "bg-zinc-800"
            }`}
            onClick={onClick}
        >
            {icon}
            {label}
        </button>
    );
}
