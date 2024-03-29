"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    BookmarkIcon,
    Cog6ToothIcon,
    PlusIcon,
    RectangleStackIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import styles from "./styles.module.css";
import { useAppWindow } from "@/lib/window";
import Tooltip from "../Tooltip";
import Link from "../Link";
import { useClickAway, useLocalStorage } from "@uidotdev/usehooks";
import { List, Mapping, Media, Provider } from "@/lib/db/types";
import { motion, AnimatePresence } from "framer-motion";
import { ProviderAPI, providers } from "@/lib/providers";
import { useSidebarExpanded } from "./hooks";
import { useMessages } from "@/lib/messages";
import { getBulkMedia } from "@/lib/db/utils";
import { useSelectedProvider } from "@/lib/providers/hooks";
import dynamic from "next/dynamic";

interface ListWithMedia extends List {
    media: Media[];
}

const SettingsModal = dynamic(() => import("../SettingsModal"));
const CreateListModal = dynamic(() => import("../CreateListModal"));

export default function SideBar() {
    const [isCreateListModalOpen, setIsCreateListModalOpen] =
        React.useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

    const [isExpanded, setIsExpanded] = useSidebarExpanded();

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "b") {
                event.preventDefault();
                setIsExpanded(!isExpanded);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isExpanded]);

    return (
        <div
            className={`${
                isExpanded ? "w-60" : "w-14"
            } bg-zinc-950 flex flex-col`}
        >
            <MenuButtons />
            <Lists
                isCreateListModalOpen={isCreateListModalOpen}
                setIsCreateListModalOpen={setIsCreateListModalOpen}
            />
            <UserProfile
                openSettingsModal={() => {
                    setIsSettingsModalOpen(true);
                }}
            />
            <CreateListModal
                isOpen={isCreateListModalOpen}
                closeModal={() => {
                    setIsCreateListModalOpen(false);
                }}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                closeModal={() => {
                    setIsSettingsModalOpen(false);
                }}
            />
        </div>
    );
}

function MenuButton({
    icon,
    title,
    href,
}: {
    icon: JSX.Element;
    title: string;
    href: string;
}): JSX.Element {
    const pathname = usePathname();
    const [isExpanded] = useLocalStorage("Naoka:SideBar:Expanded", "true");

    return (
        <Tooltip
            label={title}
            position="right"
            enabled={isExpanded == "false"}
            className="!w-full"
        >
            <Link
                href={href}
                className={`!flex flex-row items-center p-2 gap-4 hover:bg-zinc-700 active:bg-zinc-800 rounded transition cursor-pointer !w-full flex-1 ${
                    pathname == href && "bg-zinc-800"
                }`}
            >
                {icon}
                {isExpanded == "true" && <div>{title}</div>}
            </Link>
        </Tooltip>
    );
}

function IconButton({
    icon,
    onClick = () => {},
}: {
    icon: JSX.Element;
    onClick?: () => void;
}): JSX.Element {
    return (
        <button
            className="p-2 rounded hover:bg-zinc-700 transition active:bg-zinc-800"
            onClick={onClick}
        >
            {icon}
        </button>
    );
}

function MenuButtons(): JSX.Element {
    const appWindow = useAppWindow();
    const [isExpanded, setIsExpanded] = useSidebarExpanded();
    const m = useMessages();

    return (
        <div className="pb-2">
            <div className="flex flex-row items-stretch">
                <div className="p-2">
                    <IconButton
                        icon={<Bars3Icon className="w-6 h-6" />}
                        onClick={() => {
                            setIsExpanded(!isExpanded);
                        }}
                    />
                </div>
                <div
                    className="flex-1 cursor-grab active:cursor-grabbing"
                    onMouseDown={() => {
                        appWindow?.startDragging();
                    }}
                ></div>
            </div>
            <div className="flex flex-col p-2">
                <MenuButton
                    icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                    title={m("sidebar_search")}
                    href="/app/search/"
                />
                <MenuButton
                    icon={<BookmarkIcon className="w-6 h-6" />}
                    title={m("sidebar_library")}
                    href="/app/library/"
                />
            </div>
        </div>
    );
}

function ListButton({ list }: { list: ListWithMedia }) {
    const images = list.media.map((v: Media) => v.imageUrl);
    const title = list.name;
    const subtitle =
        list.items.length > 0
            ? `${list.items.length} item${list.items.length > 1 ? "s" : ""}`
            : "No items";

    const [isExpanded] = useSidebarExpanded();

    const samePathname = usePathname() == "/app/list/";
    const sameId = useSearchParams().get("id") == list.id!.toString();
    const isSelected = samePathname && sameId;

    return (
        <Link
            href={`/app/list/?id=${encodeURIComponent(list.id!)}`}
            className={`hover:bg-zinc-700 active:bg-zinc-800 transition rounded group flex flex-row items-center gap-2 -m-2 ${
                isExpanded ? "p-2" : " p-1 justify-center"
            } ${isSelected && "bg-zinc-800"}`}
        >
            {images.length < 2 ? (
                <div
                    className={`w-8 h-8 rounded flex flex-col items-center justify-center transition group-hover:bg-zinc-600 group-active:bg-zinc-700 ${
                        isSelected ? "bg-zinc-700" : "bg-zinc-800"
                    }`}
                >
                    <RectangleStackIcon className="h-4 w-4 text-zinc-400 stroke-2" />
                </div>
            ) : (
                <div className="h-8 w-8 relative">
                    <img
                        src={images[0]!}
                        className="rounded absolute top-0 left-0 bottom-0 aspect-cover object-center object-cover h-full z-10"
                    />
                    <img
                        src={images[1]!}
                        className="rounded absolute top-0 right-0 bottom-0 aspect-cover object-center object-cover h-full"
                    />
                </div>
            )}
            {isExpanded && (
                <div className="flex-1 flex flex-col gap-1 items-start">
                    <div className="text-sm text-zinc-200 line-clamp-1 leading-none">
                        {title}
                    </div>
                    <div className="text-xs text-zinc-400 line-clamp-1 leading-none">
                        {subtitle}
                    </div>
                </div>
            )}
        </Link>
    );
}

function Lists({
    isCreateListModalOpen,
    setIsCreateListModalOpen,
}: {
    isCreateListModalOpen: boolean;
    setIsCreateListModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
    const [isExpanded, setIsExpanded] = useSidebarExpanded();
    const m = useMessages();

    const [selectedProvider] = useSelectedProvider();

    const lists: ListWithMedia[] | undefined = useLiveQuery(
        () =>
            db.lists.toArray(async (lists) => {
                let mediaMappings: Array<Mapping> = [];

                for (const list of lists) {
                    list.items.map((mapping: Mapping) =>
                        mediaMappings.push(mapping)
                    );
                }

                const mappingsSet = [...new Set(mediaMappings)];
                const media: Media[] = (await getBulkMedia(
                    mappingsSet,
                    selectedProvider
                )) as Media[];

                return lists.map((list) => {
                    const listWithMedia = list as ListWithMedia;
                    listWithMedia.media = media.filter((v, i) =>
                        list.items.includes(mappingsSet[i])
                    );
                    return listWithMedia;
                });
            }),
        [selectedProvider]
    );

    return (
        <div
            className={`flex-1 overflow-y-auto border-y border-zinc-900 py-4 px-3 flex flex-col gap-4 ${
                styles.sidebarLists
            } ${!isExpanded && "gap-6"}`}
        >
            {isExpanded ? (
                <div className="flex flex-row items-center justify-between">
                    <div className="uppercase text-white/50 text-xs">
                        {m("sidebar_lists")}
                    </div>
                    <div className="flex flex-row items-center gap-2 -my-0.5">
                        <button
                            className="text-white/50 hover:text-white/70 transition"
                            onClick={() => setIsCreateListModalOpen(true)}
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <RectangleStackIcon className="h-6 w-6 text-white/50 shrink-0" />
            )}
            {lists ? (
                lists.length > 0 ? (
                    lists.map((list, index) => (
                        <ListButton key={list.id} list={list} />
                    ))
                ) : (
                    isExpanded && (
                        <div className="flex-1 flex flex-col justify-center items-center text-zinc-300 text-sm">
                            <div className="mb-1">(⩾﹏⩽)</div>
                            <div>{m("sidebar_lists_empty_title")}</div>
                            <div className="opacity-50 text-xs">
                                {m("sidebar_lists_empty_subtitle")}
                            </div>
                        </div>
                    )
                )
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="h-4 w-4 border-2 border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}

function ProviderButton({
    code,
    closeSelect,
}: {
    code: Provider;
    closeSelect: () => void;
}) {
    const api = new ProviderAPI(code);
    const accounts = useLiveQuery(() =>
        db.externalAccounts.where("provider").equals(code).toArray()
    );
    const [selectedProvider, setSelectedProvider] = useLocalStorage(
        "Naoka:Provider:Selected",
        "anilist"
    );

    return (
        <button
            className="flex flex-row items-center gap-2 rounded hover:bg-zinc-800 p-1 transition"
            onClick={() => {
                setSelectedProvider(code);
                closeSelect();
            }}
        >
            <img
                src={`/providers/${code}/icon.png`}
                className="h-8 w-8 rounded object-center object-cover"
            />
            <div className="flex flex-row items-center gap-1">
                <span className="text-sm text-zinc-300 leading-none line-clamp-1 shrink-0">
                    {api.name}
                </span>
                {!!accounts?.length && (
                    <span className="text-sm text-left text-zinc-500 leading-none line-clamp-1">
                        <span className="">- </span>
                        {accounts
                            ?.map((account) => account.user?.name)
                            .filter((v) => !!v)
                            .join(", ")}
                    </span>
                )}
            </div>
        </button>
    );
}

function UserProfile({ openSettingsModal }: { openSettingsModal: () => void }) {
    const [isExpanded] = useSidebarExpanded();

    const [isProviderSelectOpen, setIsProviderSelectOpen] =
        React.useState(false);
    const providerSelectRef = useClickAway<HTMLDivElement>(() => {
        setIsProviderSelectOpen(false);
    });

    const m = useMessages();

    const [selectedProvider] = useLocalStorage(
        "Naoka:Provider:Selected",
        "anilist"
    );
    const externalAccount = useLiveQuery(
        () =>
            db.externalAccounts
                .where("provider")
                .equals(selectedProvider)
                .first(),
        [selectedProvider]
    );

    const api = new ProviderAPI(selectedProvider as Provider);

    return (
        <div
            className="p-2 relative flex items-center gap-2"
            style={{
                flexDirection: isExpanded ? "row" : "column-reverse",
            }}
        >
            <AnimatePresence>
                {isProviderSelectOpen && (
                    <motion.div
                        initial={{
                            y: "0.5rem",
                            opacity: 0,
                        }}
                        animate={{
                            y: "0rem",
                            opacity: 1,
                        }}
                        exit={{
                            y: "0.5rem",
                            opacity: 0,
                        }}
                        transition={{ duration: 0.15 }}
                        ref={providerSelectRef}
                        className={`absolute left-2 p-1 w-56 z-10 rounded bg-zinc-900 border border-zinc-800 flex flex-col items-stretch drop-shadow-2xl ${
                            isExpanded ? "bottom-0 mb-16" : "bottom-2 mb-12"
                        }`}
                    >
                        {Object.getOwnPropertyNames(providers).map(
                            (value: string) => {
                                return (
                                    <ProviderButton
                                        code={value as Provider}
                                        closeSelect={() =>
                                            setIsProviderSelectOpen(false)
                                        }
                                    />
                                );
                            }
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                className="flex flex-row items-center gap-4 transition hover:bg-zinc-700 active:bg-zinc-800 w-full rounded"
                onClick={() => setIsProviderSelectOpen(true)}
            >
                <img
                    src={
                        externalAccount?.user?.imageUrl ??
                        `/providers/${selectedProvider}/icon.png`
                    }
                    className="h-10 w-10 rounded object-cover object-center"
                />
                {isExpanded && (
                    <div className="flex flex-col gap-1 flex-1 items-start">
                        <div className="leading-none text-sm">
                            {externalAccount?.user?.name ?? api.name}
                        </div>
                        {externalAccount && externalAccount.user && (
                            <div className="text-xs text-white/50 leading-none">
                                {api.name}
                            </div>
                        )}
                    </div>
                )}
            </button>
            <Tooltip
                label={m("sidebar_settings")}
                enabled={!isExpanded}
                position="right"
            >
                <IconButton
                    icon={<Cog6ToothIcon className="w-6 h-6" />}
                    onClick={openSettingsModal}
                />
            </Tooltip>
        </div>
    );
}
