"use client";

import React from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MinusIcon,
    Square2StackIcon,
    StopIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    toggleWindowMaximize,
    useAppWindow,
    useMaximized,
} from "@/utils/window";
import { useLocalStorage } from "@uidotdev/usehooks";

export default function NavigationBar(): JSX.Element {
    const appWindow = useAppWindow();
    const isMaximized = useMaximized(appWindow);

    const [isExpanded, setIsExpanded] = useLocalStorage(
        "Naoka:SideBar:Expanded",
        "true"
    );

    return (
        <div
            className={`fixed top-0 left-0 right-0 flex flex-row items-center justify-between pointer-events-none z-50 ${
                isExpanded == "true" ? "ml-60" : "ml-14"
            }`}
        >
            <div className="flex flex-row items-center gap-4 p-4 pointer-events-auto">
                <button
                    className="text-white/70 hover:text-white"
                    onClick={() => {
                        window.history.back();
                    }}
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                    className="text-white/70 hover:text-white"
                    onClick={() => {
                        window.history.forward();
                    }}
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div
                data-tauri-drag-region
                className="flex flex-row items-center mr-2 w-fit pointer-events-auto"
            >
                <button
                    className="p-2 rounded hover:bg-zinc-800 transition"
                    onClick={() => {
                        appWindow?.minimize();
                    }}
                >
                    <MinusIcon className="h-4 w-4" />
                </button>
                <button
                    className="p-2 rounded hover:bg-zinc-800 transition"
                    onClick={() => toggleWindowMaximize(appWindow)}
                >
                    {isMaximized ? (
                        <Square2StackIcon className="h-4 w-4" />
                    ) : (
                        <StopIcon className="h-4 w-4" />
                    )}
                </button>
                <button
                    className="p-2 rounded hover:bg-red-400 transition"
                    onClick={() => {
                        appWindow?.close();
                    }}
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export function VerticalNavSpacer() {
    return (
        <div className="py-4">
            <div className="h-6"></div>
        </div>
    );
}

export function LeftNavSpacer() {
    return <div className="w-24"></div>;
}
