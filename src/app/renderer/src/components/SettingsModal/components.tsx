import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function Setting({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-row items-start gap-8">
            <div className="flex-1">
                <div className="text-zinc-200">{title}</div>
                <div className="text-zinc-400 text-sm">{subtitle}</div>
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
