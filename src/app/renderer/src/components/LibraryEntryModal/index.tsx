import { AnimatePresence } from "framer-motion";

import { useLiveQuery } from "dexie-react-hooks";

import {
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HeartIcon,
    InformationCircleIcon,
    PlusIcon,
    StarIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import { db } from "@/lib/db";
import React from "react";
import { defaultLibraryEntry } from "@/lib/db/defaults";
import ImageModal from "../ImageModal";
import Modal from "../Modal";
import AddToListModal from "../AddToListModal";
import ConfirmModal from "../ConfirmModal";
import MediaDetailsModal from "../MediaDetailsModal";
import {
    LibraryEntry,
    LibraryStatus,
    Mapping,
    MediaRating,
    MediaType,
} from "@/lib/db/types";
import { useMedia } from "@/lib/db/utils";
import { getMediaTitle, useTitleLanguage } from "@/lib/settings";
import { Messages } from "@/lib/messages/translations";
import { useMessages } from "@/lib/messages";

export default function LibraryEntryModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping | null;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {mapping && <FormModal mapping={mapping} closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function FormModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping;
    closeModal: () => void;
}) {
    const mediaType = mapping.split(":")[1] as MediaType;

    const libraryEntry: LibraryEntry | undefined = useLiveQuery(
        () => db.library.get({ mapping }),
        [mapping],
        {
            ...defaultLibraryEntry,
            type: mediaType,
            mapping: mapping,
        }
    );
    const isFavorite = libraryEntry?.favorite || false;

    const media = useMedia(mapping);

    const formRef = React.useRef<HTMLFormElement>(null);

    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [isAddToListModalOpen, setIsAddToListModalOpen] =
        React.useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

    const [isRemoveFromLibraryModalOpen, setIsRemoveFromLibraryModalOpen] =
        React.useState(false);

    const [titleLanguage] = useTitleLanguage();

    const m = useMessages();

    if (!media) return null;

    function save(overrides = {}) {
        const formData = new FormData(formRef.current!);

        const newLibraryEntry: LibraryEntry = {
            type: mediaType,
            favorite: isFavorite,
            status: formData.get("status") as LibraryStatus,
            score: parseInt(formData.get("score") as string),
            episodeProgress:
                parseInt(formData.get("episodeProgress") as string) || 0,
            chapterProgress:
                parseInt(formData.get("chapterProgress") as string) || 0,
            volumeProgress:
                parseInt(formData.get("volumeProgress") as string) || 0,
            restarts: parseInt(formData.get("restarts") as string),
            startDate: formData.get("startDate")
                ? new Date(formData.get("startDate") as string)
                : null,
            finishDate: formData.get("finishDate")
                ? new Date(formData.get("finishDate") as string)
                : null,
            notes: formData.get("notes") as string,
            mapping: mapping,
            updatedAt: new Date(),
            ...overrides,
        };

        db.library
            .put(newLibraryEntry)
            .then((value) => {})
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <>
            <Modal closeModal={closeModal}>
                <div className="w-screen max-w-3xl max-h-[calc(100vh-8rem)] bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto">
                    <div
                        className="h-40 bg-center bg-cover opacity-40 absolute top-0 bottom-0 left-0 right-0"
                        style={{
                            backgroundImage: `url(${
                                media.bannerUrl
                                    ? media.bannerUrl
                                    : media.imageUrl
                            })`,
                        }}
                    ></div>
                    <div className="flex flex-row px-8 py-4 gap-4 relative h-40 items-end">
                        <div className="absolute top-2 right-2 flex flex-row items-center gap-2">
                            <button className="flex flex-row items-center gap-2 text-xs p-2 leading-none rounded hover:bg-zinc-950/20 transition" onClick={() => setIsDetailsModalOpen(true)}>
                                <InformationCircleIcon className="h-4 w-4 stroke-2" />
                                Details
                            </button>
                            <button
                                className="flex flex-row items-center gap-2 text-xs p-2 leading-none rounded hover:bg-zinc-950/20 transition"
                                onClick={() => {
                                    setIsAddToListModalOpen(true);
                                }}
                            >
                                <PlusIcon className="h-4 w-4 stroke-2" />
                                Add to list
                            </button>
                            <button
                                className="flex flex-row items-center gap-2 text-xs p-2 leading-none rounded hover:bg-zinc-950/20 transition"
                                onClick={() => {
                                    db.library
                                        .update(mapping, {
                                            favorite: !isFavorite,
                                        })
                                        .then((updated) => {
                                            if (!updated) {
                                                db.library
                                                    .add({
                                                        ...defaultLibraryEntry,
                                                        type: mediaType,
                                                        mapping: mapping,
                                                        favorite: !isFavorite,
                                                    })
                                                    .then((value) => {});
                                            }
                                        });
                                }}
                            >
                                <HeartIcon
                                    className={`h-4 w-4 stroke-2 ${
                                        libraryEntry?.favorite
                                            ? "text-red-400 fill-red-400"
                                            : ""
                                    }`}
                                />
                                Favorite
                            </button>
                            <button
                                className="p-2 rounded-full"
                                onClick={closeModal}
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <img
                            className="w-24 aspect-cover rounded -mb-10 object-cover object-center ring-1 ring-transparent hover:ring-zinc-100 transition-all cursor-pointer"
                            src={media.imageUrl!}
                            onClick={() => {
                                setIsImageModalOpen(true);
                            }}
                        />
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="text-xs text-zinc-400">
                                {([MediaRating.RPlus, MediaRating.Rx].includes(
                                    // May be null/undefined but that's fine. The ! is just
                                    // for type checking.
                                    media.rating!
                                ) ||
                                    !!media.isAdult) && (
                                    <>
                                        <span className="text-red-500">
                                            Adult
                                        </span>{" "}
                                        —
                                    </>
                                )}{" "}
                                {media.startDate?.getFullYear() || ""}{" "}
                                {m(
                                    `media_format_${media.format}` as keyof Messages
                                ) || ""}
                            </div>
                            <div className="text-lg leading-tight flex-1">
                                {getMediaTitle(media, titleLanguage)}
                            </div>
                        </div>
                    </div>
                    <form
                        className="p-8 pt-12 grid grid-cols-3 gap-8"
                        onSubmit={(e) => e.preventDefault()}
                        ref={formRef}
                    >
                        <LibraryEntryInput title="Status">
                            <SelectInput
                                defaultValue={
                                    libraryEntry?.status || "not_started"
                                }
                                name="status"
                            >
                                <option value="not_started">
                                    Not{" "}
                                    {mediaType == "anime" ? "watched" : "read"}
                                </option>
                                <option value="planned">Planned</option>
                                <option value="in_progress">
                                    {mediaType == "anime"
                                        ? "Watching"
                                        : "Reading"}
                                </option>
                                <option value="paused">Paused</option>
                                <option value="dropped">Dropped</option>
                                <option value="completed">Completed</option>
                            </SelectInput>
                        </LibraryEntryInput>
                        <LibraryEntryInput
                            title="Rating"
                            label={
                                ((libraryEntry?.score || 0) / 20) % 1 != 0
                                    ? `${libraryEntry?.score}/100`
                                    : undefined
                            }
                        >
                            <RatingInput
                                stars={5}
                                defaultValue={
                                    libraryEntry?.score
                                        ? Math.floor(
                                              (libraryEntry?.score || 0) / 20
                                          )
                                        : null
                                }
                                name="score"
                            />
                        </LibraryEntryInput>
                        {mediaType == "anime" ? (
                            <LibraryEntryInput title="Episode Progress">
                                <NumberInput
                                    defaultValue={
                                        libraryEntry?.episodeProgress || 0
                                    }
                                    min={0}
                                    max={media.episodes}
                                    name="episodeProgress"
                                />
                            </LibraryEntryInput>
                        ) : (
                            <LibraryEntryInput title="Chapter Progress">
                                <NumberInput
                                    defaultValue={
                                        libraryEntry?.chapterProgress || 0
                                    }
                                    min={0}
                                    max={media.chapters}
                                    name="chapterProgress"
                                />
                            </LibraryEntryInput>
                        )}
                        <LibraryEntryInput title="Start Date">
                            <DateInput
                                defaultValue={
                                    libraryEntry?.startDate
                                        ?.toISOString()
                                        .split("T")[0]
                                }
                                name="startDate"
                            />
                        </LibraryEntryInput>
                        <LibraryEntryInput title="Finish Date">
                            <DateInput
                                defaultValue={
                                    libraryEntry?.finishDate
                                        ?.toISOString()
                                        .split("T")[0]
                                }
                                name="finishDate"
                            />
                        </LibraryEntryInput>
                        {mediaType == "anime" ? (
                            <LibraryEntryInput title={"Total Rewatches"}>
                                <NumberInput
                                    defaultValue={libraryEntry?.restarts || 0}
                                    min={0}
                                    name="restarts"
                                />
                            </LibraryEntryInput>
                        ) : (
                            <LibraryEntryInput title={"Volume Progress"}>
                                <NumberInput
                                    defaultValue={
                                        libraryEntry?.volumeProgress || 0
                                    }
                                    min={0}
                                    max={media.volumes}
                                    name="volumeProgress"
                                />
                            </LibraryEntryInput>
                        )}
                        <LibraryEntryInput
                            title="Notes"
                            span={mediaType == "anime" ? 3 : 2}
                        >
                            <TextArea
                                rows={1}
                                name="notes"
                                defaultValue={libraryEntry?.notes}
                            />
                        </LibraryEntryInput>
                        {mediaType == "manga" && (
                            <LibraryEntryInput title={"Total Rereads"}>
                                <NumberInput
                                    defaultValue={libraryEntry?.restarts || 0}
                                    min={0}
                                    name="restarts"
                                />
                            </LibraryEntryInput>
                        )}
                        <div className="flex flex-row items-center justify-between col-span-3">
                            {libraryEntry ? (
                                <button
                                    className="text-sm rounded p-2 border border-zinc-700 leading-none text-zinc-400 transition hover:border-red-400 hover:bg-red-400 hover:text-zinc-950"
                                    onClick={() => {
                                        setIsRemoveFromLibraryModalOpen(true);
                                    }}
                                >
                                    Remove from library
                                </button>
                            ) : (
                                <div></div>
                            )}
                            <button
                                className="bg-zinc-100 border border-transparent rounded py-2 px-4 leading-none text-sm text-zinc-950 hover:opacity-70 transition"
                                onClick={() => {
                                    // Don't replace by onClick={save} as it'll add
                                    // all event props to the lib entry
                                    save();
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            <ImageModal
                imageUrl={isImageModalOpen ? media.imageUrl : null}
                closeModal={() => setIsImageModalOpen(false)}
            />
            <AddToListModal
                mapping={isAddToListModalOpen ? mapping : undefined}
                closeModal={() => setIsAddToListModalOpen(false)}
            />
            <ConfirmModal
                title="Remove from library"
                content="This will delete this entry from your library and from your favorites."
                onConfirm={() => {
                    db.library
                        .delete(mapping)
                        .then(() => {
                            closeModal();
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }}
                isOpen={isRemoveFromLibraryModalOpen}
                closeModal={() => setIsRemoveFromLibraryModalOpen(false)}
            />
            <MediaDetailsModal
                mapping={isDetailsModalOpen ? mapping : null}
                closeModal={() => setIsDetailsModalOpen(false)}
            />
        </>
    );
}

function LibraryEntryInput({
    title,
    label,
    span = 1,
    children,
}: {
    title: string;
    label?: string;
    span?: number;
    children: React.ReactNode;
}) {
    return (
        <div
            className="w-full"
            style={{
                gridColumn: `span ${span} / span ${span}`,
            }}
        >
            <div className="flex flex-row items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">{title}</span>
                {label && <div className="text-xs text-zinc-500">{label}</div>}
            </div>
            {children}
        </div>
    );
}

function SelectInput({ children, ...props }: { [key: string]: any }) {
    return (
        <div className="w-full relative">
            <select
                className="rounded p-2 leading-none bg-zinc-900 w-full cursor-pointer text-sm outline-none appearance-none peer h-8"
                {...props}
            >
                {children}
            </select>
            <ChevronDownIcon className="h-4 w-4 absolute top-0 bottom-0 right-2 my-auto pointer-events-none peer-focus:rotate-180 transition-transform" />
        </div>
    );
}

function RatingInput({
    stars,
    defaultValue,
    ...props
}: {
    stars: 5 | 10;
    defaultValue: number | null;
    [key: string]: any;
}) {
    const [markedStars, setMarkedStars] = React.useState<number | null>(
        defaultValue
    );
    const [hoveredStarIndex, setHoveredStarIndex] = React.useState<
        number | null
    >(null);

    return (
        <>
            <div className="w-full bg-zinc-900 rounded h-8 flex flex-row items-center justify-center gap-1 relative">
                {Array.from({ length: stars }).map((_, index: number) => {
                    return (
                        <StarIcon
                            className={`h-5 w-5 cursor-pointer stroke-2 transition-all ${
                                hoveredStarIndex != null &&
                                (hoveredStarIndex == index
                                    ? "scale-110"
                                    : "scale-90")
                            } ${
                                hoveredStarIndex != null
                                    ? hoveredStarIndex >= index
                                        ? hoveredStarIndex <= 1
                                            ? "fill-red-400 text-red-400"
                                            : hoveredStarIndex == 2
                                            ? "fill-orange-400 text-orange-400"
                                            : "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent"
                                    : !!markedStars && markedStars > index
                                    ? markedStars <= 2
                                        ? "fill-red-400 text-red-400"
                                        : markedStars == 3
                                        ? "fill-orange-400 text-orange-400"
                                        : "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent"
                            }`}
                            onMouseEnter={() => {
                                setHoveredStarIndex(index);
                            }}
                            onMouseLeave={() => {
                                setHoveredStarIndex(null);
                            }}
                            onClick={() => {
                                setMarkedStars(index + 1);
                            }}
                        />
                    );
                })}
                {!!markedStars && markedStars > 0 && (
                    <button
                        className="absolute top-0 bottom-0 right-0 p-2 my-auto text-zinc-400 hover:text-zinc-200 transition"
                        onClick={() => {
                            setMarkedStars(null);
                        }}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            <input
                type="hidden"
                value={markedStars ? markedStars * 20 : ""}
                name={props.name}
            />
        </>
    );
}

function NumberInput({ ...props }: { [key: string]: any }) {
    // For some reason that I wasn't able to figure out, the value is converted
    // to a string if it is 0, so there is an extra check for it's type before
    // making maths on it (to prevent 01, 011 instead of 1, 2).
    const [value, setValue] = React.useState(props.defaultValue || 0);
    delete props.defaultValue;

    const [updateDirection, setUpdateDirection] = React.useState<
        "up" | "down" | null
    >(null);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            switch (updateDirection) {
                case "up":
                    if (props.max != undefined && value >= props.max) return;
                    setValue(
                        (v: number) =>
                            (typeof v == "string" ? parseInt(v) : v) + 1
                    );
                    break;
                case "down":
                    if (props.min != undefined && value <= props.min) return;
                    setValue(
                        (v: number) =>
                            (typeof v == "string" ? parseInt(v) : v) - 1
                    );
                    break;
            }
        }, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, [updateDirection, value]);

    return (
        <div className="w-full relative">
            <input
                type="number"
                autoComplete="none"
                className="rounded p-2 leading-none bg-zinc-900 w-full text-sm outline-none peer h-8"
                onChange={(e) => {
                    setValue(e.target.value);

                    if (props.onChange) {
                        props.onChange(e);
                    }
                }}
                value={value}
                {...props}
            />
            <div className="flex flex-col items-stretch justify-stretch absolute top-0 bottom-0 right-0 w-5">
                <button
                    className="flex-1 pt-0.5"
                    onMouseDown={() => {
                        setUpdateDirection("up");
                    }}
                    onMouseUp={() => {
                        setUpdateDirection(null);
                    }}
                    onClick={() => {
                        if (props.max != undefined && value >= props.max)
                            return;
                        setValue(
                            (v: number) =>
                                (typeof v == "string" ? parseInt(v) : v) + 1
                        );
                    }}
                >
                    <ChevronUpIcon className="h-3 w-3" />
                </button>
                <button
                    className="flex-1 pb-0.5"
                    onMouseDown={() => {
                        setUpdateDirection("down");
                    }}
                    onMouseUp={() => {
                        setUpdateDirection(null);
                    }}
                    onClick={() => {
                        if (props.min != undefined && value <= props.min)
                            return;
                        setValue(
                            (v: number) =>
                                (typeof v == "string" ? parseInt(v) : v) - 1
                        );
                    }}
                >
                    <ChevronDownIcon className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

function DateInput({ ...props }: { [key: string]: any }) {
    return (
        <div className="w-full relative">
            <input
                type="date"
                autoComplete="none"
                className="rounded p-2 leading-none bg-zinc-900 w-full text-sm outline-none peer h-8 placeholder:text-zinc-400"
                {...props}
            />
            <CalendarIcon className="h-4 w-4 absolute top-0 bottom-0 right-2 my-auto pointer-events-none" />
        </div>
    );
}

function TextArea({ ...props }: { [key: string]: any }) {
    return (
        <div className="w-full relative">
            <textarea
                autoComplete="none"
                className="rounded p-2 bg-zinc-900 w-full text-sm outline-none peer placeholder:text-zinc-400 resize-y"
                {...props}
            />
        </div>
    );
}
