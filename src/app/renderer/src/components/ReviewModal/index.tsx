import { Mapping } from "@/lib/db/types";
import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { useLiveQuery } from "dexie-react-hooks";
import { getMedia } from "@/lib/db/utils";
import { useSelectedProvider } from "@/lib/providers/hooks";
import { getMediaTitle, useTitleLanguage } from "@/lib/settings";
import {
    CheckIcon,
    ChevronDownIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { allTrim } from "@/lib/utils";
import Popover from "../Popover";

interface Options {
    mapping?: Mapping;
    closeModal: () => void;
}

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

    const media = useLiveQuery(
        () => getMedia(props.mapping!, selectedProvider),
        [props.mapping, selectedProvider]
    );

    if (!media) return null;

    return (
        <Modal closeModal={props.closeModal}>
            <div className="w-screen max-w-3xl bg-zinc-800 rounded text-sm">
                <div className="flex flex-col gap-2 p-4">
                    <h2 className="text-xl leading-none">Write a Review</h2>
                    <div className="text-zinc-400 leading-none">
                        {getMediaTitle(media, titleLanguage)}
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-px py-px bg-zinc-700">
                    {[
                        ["Characters"],
                        ["Illustration"],
                        ["Soundtrack"],
                        ["Animation/Visuals"],
                        ["Creativity"],
                        ["Voice Acting"],
                        ["Writing/Dialogue"],
                        ["Engagement"],
                    ].map(([title]) => (
                        <ScoringCell title={title} />
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <ReviewEditor />
                    <div className="flex flex-row items-center gap-4">
                        <div className="flex-1 flex flex-col">
                            <SummaryEditor />
                        </div>
                        <div className="flex flex-col gap-2 w-40 relative">
                            <div className="text-xs text-zinc-400 leading-none">
                                Overall Critical Rating
                            </div>
                            <RatingInput />
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4 p-4">
                    <button className="leading-none py-2 px-4 rounded bg-zinc-700 hover:bg-zinc-600 transition text-zinc-300 relative">
                        Delete review
                    </button>
                    <div className="flex-1"></div>
                    <label
                        htmlFor="is-private"
                        className="flex flex-row items-center gap-2 relative cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            id="is-private"
                            className="peer hidden"
                        />
                        <div className="border border-zinc-300 rounded-sm h-3 w-3 peer-checked:bg-zinc-300 transition">
                            <CheckIcon className="h-3 w-3 text-zinc-800 stroke-2" />
                        </div>
                        <div>Private</div>
                    </label>
                    <button className="leading-none py-2 px-4 rounded bg-zinc-300 hover:bg-zinc-400 transition text-zinc-800 relative">
                        Publish review
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function ScoringCell({ title }: { title: string }) {
    return (
        <div className="bg-zinc-800 p-4 flex flex-col gap-2 items-start justify-center relative">
            <div className="text-zinc-400 leading-none text-xs">{title}</div>
            <RatingInput />
        </div>
    );
}

function RatingInput() {
    return (
        <div className="relative w-full">
            <select className="bg-zinc-900 text-zinc-300 rounded outline-none p-2 appearance-none w-full cursor-pointer peer leading-[1.20]">
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
            </select>
            <ChevronDownIcon className="h-4 w-4 stroke-2 absolute top-0 bottom-0 right-2 m-auto peer-focus:rotate-180 transition-transform pointer-events-none" />
        </div>
    );
}

function ReviewEditor() {
    const [reviewContent, setReviewContent] = React.useState("");

    return (
        <div className="bg-zinc-900 rounded relative">
            <div className="border-b border-b-zinc-800 w-full flex flex-row items-center px-2">
                <EditorTab label="Write" active={true} />
                <EditorTab label="Preview" active={false} />
                <div className="flex-1"></div>
                <Popover
                    content={
                        <div className="p-2 w-96 flex flex-col gap-1">
                            <div className="text-zinc-200">Tips for new writers</div>
                            <div className="text-zinc-400 text-xs">
                                <ol className="list-decimal list-inside flex flex-col gap-1">
                                    <li>Your first 105 words will be visible above the read more: Make them interesting!</li>
                                    <li>The best reviews use pronouns (I, me, my, you) very rarely.</li>
                                    <li>Avoid unnecessary openers: “This is my first review, please forgive any mistakes.”</li>
                                    <li>You can describe what the work is about, but keep in mind that readers have already seen the synopsis.</li>
                                    <li>Leave an extra line between paragraphs for easier reading.</li>
                                </ol>
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
            <textarea
                className="text-zinc-300 p-4 w-full bg-transparent placeholder:text-zinc-400 resize-y"
                placeholder="Write your review here. Markdown is supported!"
                rows={5}
                value={reviewContent}
                onChange={(e: any) => setReviewContent(e.target.value)}
            ></textarea>
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
                            className="peer hidden"
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

function EditorTab({ label, active }: { label: string; active: boolean }) {
    return (
        <button
            className={`transition p-2 hover:text-zinc-200 ${
                active ? "text-zinc-200" : "text-zinc-400"
            }`}
        >
            {label}
        </button>
    );
}

function SummaryEditor() {
    return (
        <div className="flex flex-col gap-2 leading-none">
            <div className="text-zinc-400 text-xs leading-none">Summary</div>
            <input
                className="rounded py-2 px-4 leading-none text-zinc-300 bg-zinc-900 w-full placeholder:text-zinc-400"
                type="text"
                placeholder="Summarize your review in 140 characters or less"
                max={140}
            />
        </div>
    );
}
