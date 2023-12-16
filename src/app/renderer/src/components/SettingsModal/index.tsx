"use client";

import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { PaintBrushIcon } from "@heroicons/react/24/outline";
import React from "react";
import Appearance from "./tabs/appearance";

export default function SettingsModal({
    isOpen,
    closeModal,
}: {
    isOpen: boolean;
    closeModal: () => void;
}) {
    const [tab, setTab] = React.useState("appearance");

    return (
        <AnimatePresence>
            {isOpen && (
                <Modal closeModal={closeModal}>
                    <div className="rounded bg-zinc-800 w-screen max-w-4xl overflow-hidden flex flex-row items-stretch border border-zinc-800">
                        <div className="p-2 w-60 bg-zinc-900 flex flex-col items-stretch h-96">
                            <Tab
                                label="Appearance"
                                icon={<PaintBrushIcon className="h-6 w-6" />}
                                active={tab === "appearance"}
                                onClick={() => setTab("appearance")}
                            />
                        </div>
                        <div className="flex-1 p-4 overflow-y-hidden flex flex-col gap-6">
                            {tab == "appearance" ? <Appearance /> : ""}
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
