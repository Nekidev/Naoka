"use client";

import {
    CloudIcon,
    InformationCircleIcon,
    PaintBrushIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import React from "react";

import { AnimatePresence } from "framer-motion";

import Modal from "../Modal";
import { useMessages } from "@/lib/messages";

import Connections from "./tabs/connections";
import Appearance from "./tabs/appearance";
import Media from "./tabs/media";
import About from "./tabs/about";

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
                            <Tab
                                label={m("settings_media_title")}
                                icon={<SparklesIcon className="h-6 w-6" />}
                                active={tab === "media"}
                                onClick={() => setTab("media")}
                            />
                            <div className="flex-1"></div>
                            <div className="border-t border-zinc-800 -m-2 p-2 pb-0 sticky bottom-0 left-0 right-0 flex flex-col items-stretch">
                                <Tab
                                    label={m("settings_about_title")}
                                    icon={
                                        <InformationCircleIcon className="h-6 w-6" />
                                    }
                                    active={tab === "about"}
                                    onClick={() => setTab("about")}
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 flex flex-col flex-1 gap-6 min-h-max">
                                {tab == "appearance" ? (
                                    <Appearance />
                                ) : tab == "connections" ? (
                                    <Connections />
                                ) : tab == "media" ? (
                                    <Media />
                                ) : tab == "about" ? (
                                    <About />
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
            className={`p-2 rounded hover:bg-zinc-700 active:bg-zinc-800 leading-none flex flex-row items-center gap-4 transition ${
                active && "bg-zinc-800"
            }`}
            onClick={onClick}
        >
            {icon}
            {label}
        </button>
    );
}
