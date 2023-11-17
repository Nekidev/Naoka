"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
            <div className="p-2">
                <IconButton
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    }
                />
            </div>
            <div className="flex flex-col p-2">
                <MenuItem
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                    }
                    title="Search"
                    href="/search"
                />
                <MenuItem
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                            />
                        </svg>
                    }
                    title="Explore"
                    href="/"
                />
                <MenuItem
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                            />
                        </svg>
                    }
                    title="My library"
                    href="/library"
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
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
                        AniList
                    </div>
                </div>
            </button>
            <IconButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                }
            />
        </div>
    );
}
