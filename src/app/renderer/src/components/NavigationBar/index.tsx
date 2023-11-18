"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function NavigationBar(): JSX.Element {
    return (
        <div className="fixed ml-60 top-0 left-0 flex flex-row items-center z-50">
            <div className="flex flex-row items-center gap-4 p-4">
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
