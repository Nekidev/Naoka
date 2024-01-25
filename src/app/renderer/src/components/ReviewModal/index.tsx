import { Mapping, Media, RecommendationLevel, Review } from "@/lib/db/types";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "../Modal";
import { useLiveQuery } from "dexie-react-hooks";
import { isMappingFromProvider } from "@/lib/db/utils";
import { useSelectedProvider } from "@/lib/providers/hooks";
import { getMediaTitle, useTitleLanguage } from "@/lib/settings";
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { allTrim } from "@/lib/utils";
import Popover from "../Popover";
import Markdown from "marked-react";
import Link from "../Link";
import { db } from "@/lib/db";
import { ProviderAPI, providers } from "@/lib/providers";
import { useClickAway } from "@uidotdev/usehooks";
import Tooltip from "../Tooltip";
import ConfirmModal from "../ConfirmModal";

interface Options {
    mapping?: Mapping;
    closeModal: () => void;
}

const ReviewContext = React.createContext<{
    media: Media | null;
    review: Review | null;
}>({ media: null, review: null });

export default function ReviewModal(props: Options) {
    return (
        <AnimatePresence>
            {props.mapping && <FormModal {...props} />}
        </AnimatePresence>
    );
}

function FormModal(props: Options) {
    const [selectedProvider] = useSelectedProvider();
    const [titleLanguage] = useTitleLanguage();

    const formRef = React.useRef<HTMLFormElement | null>(null);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
        React.useState(false);

    const data = useLiveQuery(async () => {
        const mappings = (await db.mappings
            .where("mappings")
            .equals(props.mapping!)
            .first())!.mappings;
        const allMedia = await db.media
            .where("mapping")
            .anyOf(mappings)
            .toArray();

        const media =
            allMedia.find((media: Media) =>
                isMappingFromProvider(media.mapping, selectedProvider)
            ) ??
            allMedia.find((media: Media) => media.mapping === props.mapping) ??
            allMedia[0]!;

        const review =
            (await db.reviews.where("mapping").anyOf(mappings).first()) ?? null;

        return { media, review };
    });

    if (!data) return null;
    const { media, review } = data;

    async function save() {
        let values: { [key: string]: string } = {};

        Array.from(new FormData(formRef.current!).entries()).map(
            ([key, value]) => {
                values[key as keyof typeof values] = value as string;
            }
        );

        const numberOrNull = (n: string) => (n === "null" ? null : Number(n));

        let updatedReview: Review = {
            ...(review || {
                mapping: props.mapping!,
            }),
            accounts: [],
            isPrivate: !!values.isPrivate,
            isSpoiler: !!values.isSpoiler,
            isPublished: false,
            illustrationScore: numberOrNull(values.illustrationScore),
            soundtrackScore: numberOrNull(values.soundtrackScore),
            animationScore: numberOrNull(values.animationScore),
            charactersScore: numberOrNull(values.charactersScore),
            creativityScore: numberOrNull(values.creativityScore),
            voiceScore: numberOrNull(values.voiceScore),
            writingScore: numberOrNull(values.writingScore),
            engagementScore: numberOrNull(values.engagementScore),
            overallScore: numberOrNull(values.overallScore),
            review: values.review,
            summary: values.summary || "",
            recommendation:
                values.recommendation === "null"
                    ? null
                    : (values.recommendation as RecommendationLevel),
            updatedAt: new Date(),
        };

        await db.reviews.put(updatedReview, review?.id || -1);
    }

    return (
        <ReviewContext.Provider
            value={{
                review,
                media,
            }}
        >
            <Modal closeModal={props.closeModal}>
                <form
                    className="w-screen max-w-3xl bg-zinc-800 rounded text-sm"
                    ref={formRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    autoComplete="none"
                >
                    <div className="flex flex-col gap-2 p-4">
                        <h2 className="text-xl leading-none">Write a Review</h2>
                        <div className="text-zinc-400 leading-none">
                            {getMediaTitle(media, titleLanguage)}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-px py-px bg-zinc-700">
                        {[
                            ["Characters", "charactersScore"],
                            ["Illustration", "illustrationScore"],
                            ["Soundtrack", "soundtrackScore"],
                            ["Animation/Visuals", "animationScore"],
                            ["Creativity", "creativityScore"],
                            ["Voice Acting", "voiceScore"],
                            ["Writing/Dialogue", "writingScore"],
                            ["Engagement", "engagementScore"],
                        ].map(([title, name]) => (
                            <ScoringCell
                                title={title}
                                name={name}
                                defaultValue={
                                    review
                                        ? review[name as keyof Review]
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        <ReviewEditor
                            defaultValue={review ? review.review : ""}
                            defaultIsSpoiler={!!(review && review.isSpoiler)}
                        />
                        <div className="flex flex-row items-center gap-4">
                            <div className="flex-1 flex flex-col">
                                <SummaryEditor
                                    defaultValue={review ? review.summary : ""}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-40 relative">
                                <div className="text-xs text-zinc-400 leading-none">
                                    Overall Critical Rating
                                </div>
                                <RatingInput
                                    name="overallScore"
                                    defaultValue={review && review.overallScore}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-40 relative">
                                <div className="text-xs text-zinc-400 leading-none">
                                    Would you recommend this?
                                </div>
                                <SelectInput
                                    name="recommendation"
                                    defaultValue={
                                        review && review.recommendation
                                    }
                                >
                                    <option value="null">Select</option>
                                    <option
                                        value={RecommendationLevel.Recommended}
                                    >
                                        Recommended
                                    </option>
                                    <option
                                        value={
                                            RecommendationLevel.MixedFeelings
                                        }
                                    >
                                        Mixed feelings
                                    </option>
                                    <option
                                        value={
                                            RecommendationLevel.NotRecommended
                                        }
                                    >
                                        Not recommended
                                    </option>
                                </SelectInput>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 p-4">
                        {review && (
                            <button
                                className="leading-none py-2 px-4 rounded bg-zinc-700 hover:bg-red-400/50 transition text-zinc-300 relative"
                                onClick={() =>
                                    setIsConfirmDeleteModalOpen(true)
                                }
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-1"></div>
                        <label
                            htmlFor="is-private"
                            className="flex flex-row items-center gap-2 relative cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                id="is-private"
                                name="isPrivate"
                                className="peer hidden"
                                defaultChecked={
                                    review ? review.isPrivate : undefined
                                }
                            />
                            <div className="border border-zinc-300 rounded-sm h-3 w-3 peer-checked:bg-zinc-300 transition">
                                <CheckIcon className="h-3 w-3 text-zinc-800 stroke-2" />
                            </div>
                            <div>Private</div>
                        </label>
                        <div className="flex flex-row items-center gap-2">
                            <button
                                className="leading-none py-2 px-4 rounded bg-zinc-700 hover:bg-zinc-600 transition text-zinc-300 relative"
                                onClick={() => {
                                    save();
                                }}
                            >
                                Save review
                            </button>
                            <Tooltip
                                label="In a future version. Stay tuned!"
                                spacing={0.5}
                            >
                                <button className="leading-none py-2 px-4 rounded bg-zinc-300 opacity-70 cursor-not-allowed transition text-zinc-900 relative">
                                    Publish review
                                </button>
                            </Tooltip>
                            {/* <PublishButton /> */}
                        </div>
                    </div>
                </form>
            </Modal>
            <ConfirmModal
                isOpen={isConfirmDeleteModalOpen}
                title="Are you sure?"
                content={`This will completely delete your ${getMediaTitle(
                    media,
                    titleLanguage
                )} review.`}
                onConfirm={async () => {
                    await db.reviews.delete(review?.id!);
                    props.closeModal();
                }}
                closeModal={() => setIsConfirmDeleteModalOpen(false)}
            />
        </ReviewContext.Provider>
    );
}

function ScoringCell({
    title,
    name,
    defaultValue,
}: {
    title: string;
    name: string;
    defaultValue: any;
}) {
    return (
        <div className="bg-zinc-800 p-4 flex flex-col gap-2 items-start justify-center relative">
            <div className="text-zinc-400 leading-none text-xs">{title}</div>
            <RatingInput name={name} defaultValue={defaultValue} />
        </div>
    );
}

function RatingInput({ ...props }: { [key: string]: any }) {
    return (
        <SelectInput {...props}>
            <option value="null">Select</option>
            <option value="100">(10) Masterpiece</option>
            <option value="90">(9) Great</option>
            <option value="80">(8) Very good</option>
            <option value="70">(7) Good</option>
            <option value="60">(6) Fine</option>
            <option value="50">(5) Average</option>
            <option value="40">(4) Bad</option>
            <option value="30">(3) Very bad</option>
            <option value="20">(2) Horrible</option>
            <option value="10">(1) Awful</option>
        </SelectInput>
    );
}

function SelectInput({
    children,
    ...props
}: {
    children: React.ReactNode;
    [key: string]: any;
}) {
    return (
        <div className="relative w-full">
            <select
                className="bg-zinc-900 text-zinc-300 rounded outline-none p-2 appearance-none w-full cursor-pointer peer leading-[1.20]"
                {...props}
            >
                {children}
            </select>
            <ChevronDownIcon className="h-4 w-4 stroke-2 absolute top-0 bottom-0 right-2 m-auto peer-focus:rotate-180 transition-transform pointer-events-none" />
        </div>
    );
}

function ReviewEditor({
    defaultValue,
    defaultIsSpoiler,
}: {
    defaultValue: string;
    defaultIsSpoiler: boolean;
}) {
    const [reviewContent, setReviewContent] = React.useState(defaultValue);
    const [tab, setTab] = React.useState(0);

    const renderer = {
        link(href: string, text: React.ReactNode) {
            return (
                <Link
                    href={href}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                >
                    {text}
                </Link>
            );
        },
        code(code: React.ReactNode, lang: string | undefined) {
            return (
                <code className="p-2 rounded bg-zinc-800 my-1 w-full block">
                    {code}
                </code>
            );
        },
        codespan(code: React.ReactNode, lang: string | null = null) {
            return (
                <code className="px-1 py-0.5 -my-0.5 rounded bg-zinc-800">
                    {code}
                </code>
            );
        },
        hr() {
            return <div className="h-1 bg-zinc-800 my-1"></div>;
        },
        list(children: React.ReactNode, ordered: boolean) {
            if (ordered) {
                return (
                    <ol className="list-decimal list-outside ml-4">
                        {children}
                    </ol>
                );
            } else {
                return (
                    <ul className="list-disc list-outside ml-4">{children}</ul>
                );
            }
        },
        listItem(children: React.ReactNode) {
            return <li>{children}</li>;
        },
        blockquote(children: React.ReactNode) {
            return (
                <blockquote className="border-l-4 border-l-zinc-800 bg-zinc-850 rounded p-2 flex flex-col gap-2">
                    {children}
                </blockquote>
            );
        },
    };

    return (
        <div className="bg-zinc-900 rounded relative">
            <div className="border-b border-b-zinc-800 w-full flex flex-row items-center px-2">
                <EditorTab
                    label="Write"
                    active={tab === 0}
                    onClick={() => setTab(0)}
                />
                <EditorTab
                    label="Preview"
                    active={tab === 1}
                    onClick={() => setTab(1)}
                />
                <div className="flex-1"></div>
                <div className="flex flex-row items-center px-1">
                    <Popover
                        content={
                            <div className="p-2 w-96 flex flex-col gap-2">
                                <div className="text-zinc-200">
                                    Markdown Guide
                                </div>
                                <div className="text-zinc-400 text-xs">
                                    <ol className="list-decimal list-outside flex flex-col gap-1 ml-3.5">
                                        <li>
                                            <code>__something__</code> or{" "}
                                            <code>**something**</code>{" "}
                                            <strong>
                                                makes your text bold
                                            </strong>
                                        </li>
                                        <li>
                                            <code>_something_</code> or{" "}
                                            <code>*something*</code>{" "}
                                            <em>makes your text italic</em>
                                        </li>
                                        <li>
                                            You can also use{" "}
                                            <code>~~something~~</code>{" "}
                                            <s>to strike through the text</s>
                                        </li>
                                        <li>
                                            <code>[Text](https://my.url)</code>{" "}
                                            will create{" "}
                                            <Link
                                                href="https://nyeki.dev"
                                                target="_blank"
                                                className="text-blue-400 hover:underline"
                                            >
                                                a link
                                            </Link>
                                        </li>
                                        <li>
                                            Just add some <code>----</code> to
                                            create a line/separator
                                        </li>
                                    </ol>
                                    <div className="mt-2">
                                        You can find the{" "}
                                        <Link
                                            href="https://github.github.com/gfm/"
                                            target="_blank"
                                            className="text-blue-400 hover:underline"
                                        >
                                            complete cheatsheet here
                                        </Link>
                                        .
                                    </div>
                                </div>
                            </div>
                        }
                        position="left"
                        spacing={0.5}
                    >
                        <button className="p-1 rounded hover:bg-zinc-800 transition">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-5"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fill="currentColor"
                                    d="M14.846 12.923H1.154A1.154 1.154 0 0 1 0 11.77V4.231a1.154 1.154 0 0 1 1.154-1.154h13.692A1.154 1.154 0 0 1 16 4.23v7.538a1.154 1.154 0 0 1-1.154 1.154Zm-11-2.308v-3l1.539 1.923l1.538-1.923v3h1.539v-5.23H6.923L5.385 7.308L3.846 5.385H2.308v5.23zM14.154 8h-1.539V5.385h-1.538V8H9.538l2.308 2.692z"
                                ></path>
                            </svg>
                        </button>
                    </Popover>
                    <Popover
                        content={
                            <div className="p-2 w-96 flex flex-col gap-2">
                                <div className="text-zinc-200">
                                    Tips for new writers
                                </div>
                                <div className="text-zinc-400 text-xs">
                                    <ol className="list-decimal list-outside flex flex-col gap-1 ml-3.5">
                                        <li>
                                            Your first 105 words will be visible
                                            above the read more: Make them
                                            interesting!
                                        </li>
                                        <li>
                                            The best reviews use pronouns (I,
                                            me, my, you) very rarely.
                                        </li>
                                        <li>
                                            Avoid unnecessary openers: “This is
                                            my first review, please forgive any
                                            mistakes.”
                                        </li>
                                        <li>
                                            You can describe what the work is
                                            about, but keep in mind that readers
                                            have already seen the synopsis.
                                        </li>
                                        <li>
                                            Leave an extra line between
                                            paragraphs for easier reading.
                                        </li>
                                    </ol>
                                    <div className="mt-2">
                                        <Link
                                            href="https://myanimelist.net/forum/?topicid=575725"
                                            target="_blank"
                                            className="text-blue-400 hover:underline"
                                        >
                                            Read the complete MAL post
                                        </Link>
                                        .
                                    </div>
                                </div>
                            </div>
                        }
                        position="left"
                        spacing={0.5}
                    >
                        <button className="p-1 rounded hover:bg-zinc-800 transition">
                            <QuestionMarkCircleIcon className="h-4 w-4 stroke-2" />
                        </button>
                    </Popover>
                </div>
            </div>
            {tab === 0 ? (
                <textarea
                    className="text-zinc-300 p-4 w-full bg-transparent placeholder:text-zinc-400 resize-y"
                    placeholder="Write your review here. Markdown is supported!"
                    onInput={(e: any) => {
                        setReviewContent(e.target.value);
                    }}
                    value={reviewContent}
                    rows={5}
                    name="review"
                ></textarea>
            ) : (
                <div className="p-4 text-zinc-300 flex flex-col gap-3 break-words">
                    {reviewContent ? (
                        <Markdown
                            value={reviewContent}
                            renderer={renderer}
                            breaks={true}
                            gfm={true}
                        />
                    ) : (
                        <div className="text-zinc-500">
                            🎵 Nya ichi ni san nya arigatou 🎵
                        </div>
                    )}
                </div>
            )}
            <div className="border-t border-t-zinc-800 w-full leading-none text-zinc-300 flex flex-row items-center">
                <div className="py-2 px-4 border-r border-r-zinc-800">
                    {reviewContent.length} characters,{" "}
                    {reviewContent.length === 0
                        ? "0"
                        : allTrim(reviewContent).split(" ").length}{" "}
                    words
                </div>
                <div className="py-2 px-4">
                    <label
                        htmlFor="is-spoiler"
                        className="flex flex-row items-center gap-2 relative cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            id="is-spoiler"
                            name="isSpoiler"
                            className="peer hidden"
                            defaultChecked={defaultIsSpoiler}
                        />
                        <div className="border border-zinc-300 rounded-sm h-3 w-3 peer-checked:bg-zinc-300 transition">
                            <CheckIcon className="h-3 w-3 text-zinc-800 stroke-2" />
                        </div>
                        <div>Is spoiler</div>
                    </label>
                </div>
            </div>
        </div>
    );
}

function EditorTab({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`transition p-2 hover:text-zinc-200 ${
                active ? "text-zinc-200" : "text-zinc-400"
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

function SummaryEditor({ defaultValue }: { defaultValue: string }) {
    return (
        <div className="flex flex-col gap-2 leading-none">
            <div className="text-zinc-400 text-xs leading-none">Summary</div>
            <input
                className="rounded py-2 px-4 leading-none text-zinc-300 bg-zinc-900 w-full placeholder:text-zinc-400"
                type="text"
                placeholder="Summarize your review in 140 characters or less"
                max={140}
                name="summary"
                autoComplete="off"
                defaultValue={defaultValue}
            />
        </div>
    );
}

function PublishButton() {
    const accounts = useLiveQuery(() =>
        db.externalAccounts
            .where("provider")
            .anyOf(
                Object.getOwnPropertyNames(providers).filter(
                    (value) =>
                        !!providers[value as keyof typeof providers].config
                            .reviews
                )
            )
            .toArray()
    );

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownButtonRef = useClickAway<HTMLButtonElement>(() =>
        setIsDropdownOpen(false)
    );

    return (
        <div className="flex flex-row gap-px items-stretch">
            <button className="leading-none py-2 px-4 rounded-l bg-zinc-300 hover:bg-zinc-400 transition text-zinc-800 relative">
                Publish review
            </button>
            <div className="relative">
                <AnimatePresence>
                    {isDropdownOpen && accounts && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 5,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: 5,
                            }}
                            transition={{
                                duration: 0.15,
                            }}
                            className="absolute bottom-[calc(100%+0.5rem)] right-0 w-60 bg-zinc-800 border border-zinc-700 drop-shadow-lg p-1 rounded flex flex-col"
                        >
                            {accounts.map((account, index) => {
                                const provider = new ProviderAPI(
                                    account.provider
                                );
                                return (
                                    <button
                                        className="p-1 rounded hover:bg-zinc-700 transition flex flex-row items-center gap-2"
                                        key={index}
                                    >
                                        <img
                                            src={account.user?.imageUrl}
                                            className="h-8 w-8 rounded object-center object-cover"
                                        />
                                        <div className="flex flex-col items-start flex-1 gap-0.5">
                                            <div className="text-sm leading-none line-clamp-1">
                                                {account.user?.name}
                                            </div>
                                            <div className="text-xs leading-none line-clamp-1 text-zinc-400">
                                                {provider.name}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    className="leading-none rounded-r bg-zinc-300 hover:bg-zinc-400 transition text-zinc-800 relative w-8 h-full flex flex-col items-center justify-center"
                    onClick={() => setIsDropdownOpen((v) => !v)}
                    ref={dropdownButtonRef}
                >
                    <ChevronUpIcon className="h-4 w-4 stroke-2" />
                </button>
            </div>
        </div>
    );
}
