"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    FireIcon,
    BookmarkIcon,
    Cog6ToothIcon,
    PlusIcon
} from "@heroicons/react/24/outline";

export default function SideBar() {
    return (
        <div className="w-60 h-screen bg-zinc-950 flex flex-col">
            <MenuButtons />
            <Lists />
            <UserProfile />
        </div>
    );
}

function MenuItem({
    icon,
    title,
    href,
}: {
    icon: JSX.Element;
    title: string;
    href: string;
}): JSX.Element {
    const pathname = usePathname();

    return (
        <Link
            href={href}
            className={
                "flex flex-row items-center p-2 gap-4 hover:bg-zinc-700 rounded transition cursor-pointer " +
                (pathname === href ? "bg-zinc-800" : "active:bg-zinc-800")
            }
        >
            {icon}
            <div>{title}</div>
        </Link>
    );
}

function IconButton({ icon }: { icon: JSX.Element }): JSX.Element {
    return (
        <button className="p-2 rounded hover:bg-zinc-700 transition active:bg-zinc-800">
            {icon}
        </button>
    );
}

function MenuButtons(): JSX.Element {
    return (
        <div className="pb-2">
            <div className="flex flex-row items-stretch">
                <div className="p-2">
                    <IconButton icon={<Bars3Icon className="w-6 h-6" />} />
                </div>
                <div className="flex-1 draggable"></div>
            </div>
            <div className="flex flex-col p-2">
                <MenuItem
                    icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                    title="Search"
                    href="/search"
                />
                {/* <MenuItem
                    icon={<FireIcon className="w-6 h-6" />}
                    title="Explore"
                    href="/"
                /> */}
                <MenuItem
                    icon={<BookmarkIcon className="w-6 h-6" />}
                    title="My library"
                    href="/"
                />
            </div>
        </div>
    );
}

function Lists(): JSX.Element {
    return (
        <div className="flex-1 border-y border-zinc-900 p-4">
            <div className="flex flex-row items-center justify-between">
                <div className="uppercase text-white/50 text-xs">My lists</div>
                <div className="flex flex-row items-center gap-2 -my-0.5">
                    <button className="text-white/50 hover:text-white/70 transition">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserProfile() {
    return (
        <div className="p-2 relative flex flex-row items-center gap-2">
            <button className="flex flex-row items-center gap-4 transition hover:bg-zinc-800 w-full rounded">
                <img
                    src="/icon.jpg"
                    className="h-10 w-10 rounded object-cover object-center"
                />
                <div className="flex flex-col gap-1 flex-1 items-start">
                    <div className="leading-none text-sm">Nyeki.py</div>
                    <div className="text-xs text-white/50 leading-none">
                        MyAnimeList
                    </div>
                </div>
            </button>
            <IconButton
                icon={
                    <Cog6ToothIcon className="w-6 h-6" />
                }
            />
        </div>
    );
}
