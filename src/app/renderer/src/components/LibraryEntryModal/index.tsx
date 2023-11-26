import { motion, AnimatePresence } from "framer-motion";

import { useLiveQuery } from "dexie-react-hooks";

import {
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HeartIcon,
    PlusIcon,
    StarIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import { LibraryStatus, Mapping, MediaType } from "@/lib/types";
import { LibraryEntry, db } from "@/lib/db";
import React from "react";
import { IntRange } from "@/utils/types";
import { defaultLibraryEntry } from "@/lib/db/defaults";

export default function LibraryEntryModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping | null;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {mapping && <Modal mapping={mapping} closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function Modal({
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

    const mediaCache = useLiveQuery(() => db.mediaCache.get({ mapping }));

    const formRef = React.useRef<HTMLFormElement>(null);

    if (!mediaCache) return null;

    function save(overrides = {}) {
        const formData = new FormData(formRef.current!);

        const newLibraryEntry: LibraryEntry = {
            type: mediaType,
            favorite: isFavorite,
            status: formData.get("status") as LibraryStatus,
            score: parseInt(formData.get("score") as string) as IntRange<
                1,
                100
            >,
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
            ...overrides,
        };

        db.library
            .put(newLibraryEntry as LibraryEntry)
            .then((value) => {})
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <motion.div
            className="fixed top-0 bottom-0 left-0 right-0 bg-zinc-950/50 flex flex-col items-center justify-center p-8 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className="absolute top-0 bottom-0 left-0 right-0"
                onClick={closeModal}
            ></div>
            <motion.div
                className="w-full max-w-3xl bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl"
                initial={{
                    translateY: 10,
                }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 10 }}
                transition={{ duration: 0.2 }}
            >
                <div
                    className="h-40 bg-center bg-cover opacity-40 absolute top-0 bottom-0 left-0 right-0"
                    style={{
                        backgroundImage: `url(${
                            mediaCache.bannerUrl || mediaCache.imageUrl
                        })`,
                    }}
                ></div>
                <div className="flex flex-row px-8 py-4 gap-4 relative h-40 items-end">
                    <div className="absolute top-2 right-2 flex flex-row items-center gap-2">
                        <button className="flex flex-row items-center gap-2 text-xs p-2 leading-none rounded hover:bg-zinc-950/20 transition">
                            <PlusIcon className="h-4 w-4 stroke-2" />
                            Add to list
                        </button>
                        <button
                            className="flex flex-row items-center gap-2 text-xs p-2 leading-none rounded hover:bg-zinc-950/20 transition"
                            onClick={() => {
                                db.library
                                    .update(mapping, { favorite: !isFavorite })
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
                        className="w-24 aspect-cover rounded -mb-10 object-cover object-center"
                        src={mediaCache.imageUrl!}
                    />
                    <div className="text-lg flex-1">{mediaCache.title}</div>
                </div>
                <form
                    className="p-8 pt-12 grid grid-cols-3 gap-8 relative"
                    onSubmit={(e) => e.preventDefault()}
                    ref={formRef}
                >
                    <LibraryEntryInput title="Status">
                        <SelectInput
                            defaultValue={libraryEntry?.status || "not_started"}
                            name="status"
                        >
                            <option value="not_started">
                                Not {mediaType == "anime" ? "watched" : "read"}
                            </option>
                            <option value="planned">Planned</option>
                            <option value="in_progress">
                                {mediaType == "anime" ? "Watching" : "Reading"}
                            </option>
                            <option value="paused">Paused</option>
                            <option value="dropped">Dropped</option>
                            <option value="completed">Completed</option>
                        </SelectInput>
                    </LibraryEntryInput>
                    <LibraryEntryInput title="Rating">
                        <RatingInput
                            stars={5}
                            defaultValue={(libraryEntry?.score || 0) / 20}
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
                                defaultValue={libraryEntry?.volumeProgress || 0}
                                min={0}
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
                            defaulValue={libraryEntry?.notes}
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
                                    db.library
                                        .delete(libraryEntry.mapping!)
                                        .then(() => {
                                            closeModal();
                                        });
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
            </motion.div>
        </motion.div>
    );
}

function LibraryEntryInput({
    title,
    span = 1,
    children,
}: {
    title: string;
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
            <span className="text-xs text-zinc-400">{title}</span>
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
    defaultValue: number;
    [key: string]: any;
}) {
    const [markedStars, setMarkedStars] = React.useState<number>(defaultValue);
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
                                    : markedStars > index
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
                {markedStars > 0 && (
                    <button
                        className="absolute top-0 bottom-0 right-0 p-2 my-auto text-zinc-400 hover:text-zinc-200 transition"
                        onClick={() => {
                            setMarkedStars(0);
                        }}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            <input type="hidden" value={markedStars * 20} name={props.name} />
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
                className="rounded p-2 bg-zinc-900 w-full text-sm outline-none peer placeholder:text-zinc-400 resize-y"
                {...props}
            ></textarea>
        </div>
    );
}