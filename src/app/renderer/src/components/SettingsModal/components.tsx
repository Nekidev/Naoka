import React from "react";
import {
    ChevronDownIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../Tooltip";

export function Header({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-xl leading-none">{title}</h1>
            <div className="text-zinc-400 text-sm">{subtitle}</div>
        </div>
    );
}

export function Setting({
    title,
    subtitle,
    info,
    orientation = "horizontal",
    children,
}: {
    title: string;
    subtitle?: string;
    info?: string;
    orientation?: "horizontal" | "vertical";
    children: React.ReactNode;
}) {
    return (
        <div
            className={`flex items-start ${
                orientation == "horizontal"
                    ? "flex-row gap-8"
                    : "flex-col gap-2"
            }`}
        >
            <div className="flex-1">
                <div className="text-zinc-200 flex flex-row items-center gap-2">
                    <span>{title}</span>
                    {info && (
                        <Tooltip
                            label="More accounts will be added soon."
                            position="right"
                            spacing={0.5}
                        >
                            <InformationCircleIcon className="h-4 w-4 stroke-2" />
                        </Tooltip>
                    )}
                </div>
                {subtitle && (
                    <div className="text-zinc-400 text-sm">{subtitle}</div>
                )}
            </div>
            {children}
        </div>
    );
}

export function Select({
    value,
    onChange,
    children,
}: {
    value: any;
    onChange: (e: any) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <select
                className="p-2 pr-8 leading-none bg-zinc-700 rounded appearance-none text-zinc-300 cursor-pointer text-sm hover:bg-zinc-600 transition"
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
            <ChevronDownIcon className="h-4 w-4 stroke-2 absolute top-0 bottom-0 right-2 m-auto pointer-events-none" />
        </div>
    );
}

export function Separator() {
    return <div className="h-px bg-zinc-700 -mx-4 -my-2 shrink-0"></div>;
}

export function Paragraph({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-stretch">
            <div className="text-zinc-200 text-base">{title}</div>
            <div className="text-sm text-zinc-400">
                {children}
            </div>
        </div>
    );
}