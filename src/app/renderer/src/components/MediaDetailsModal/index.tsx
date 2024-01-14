import { Mapping, MediaGenre, MediaRating } from "@/lib/db/types";
import { getMedia } from "@/lib/db/utils";
import { useSelectedProvider } from "@/lib/providers/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { getMediaTitle, useTitleLanguage } from "@/lib/settings";
import { useMessages } from "@/lib/messages";
import { Messages } from "@/lib/messages/translations";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function LibraryEntryModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping | null;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {mapping && <Content mapping={mapping} closeModal={closeModal} />}
        </AnimatePresence>
    );
}

function Content({
    mapping,
    closeModal,
}: {
    mapping: Mapping;
    closeModal: () => void;
}) {
    const [provider] = useSelectedProvider();
    const media = useLiveQuery(() => getMedia(mapping, provider));
    const [titleLanguage] = useTitleLanguage();
    const m = useMessages();

    if (!media) return;

    return (
        <Modal closeModal={closeModal}>
            <div className="w-screen max-w-xs max-h-[calc(100vh-8rem)] bg-zinc-800 relative rounded">
                <div className="p-4 flex flex-row items-center gap-2 border-b border-b-zinc-700">
                    <img
                        src={media?.imageUrl!}
                        className="h-10 w-10 rounded object-cover object-center"
                    />
                    <div className="flex flex-col justify-center items-start flex-1 gap-1">
                        <div className="leading-none line-clamp-1">
                            {getMediaTitle(media, titleLanguage)}
                        </div>
                        <div className="text-xs text-zinc-400 leading-none">
                            {([MediaRating.RPlus, MediaRating.Rx].includes(
                                // May be null/undefined but that's fine. The ! is just
                                // for type checking.
                                media.rating!
                            ) ||
                                !!media.isAdult) && (
                                <>
                                    <span className="text-red-500">Adult</span>{" "}
                                    —
                                </>
                            )}{" "}
                            {media.startDate?.getFullYear() || ""}{" "}
                            {m(
                                `media_format_${media.format}` as keyof Messages
                            ) || ""}
                        </div>
                    </div>
                </div>
                {/* I wanted to make the div below scrollable instead of the whole modal, but I couldn't. If you know how to do it, make a PR! */}
                <div className="p-4 flex flex-col gap-4">
                    {media?.format && (
                        <Detail title="Format">
                            {m(
                                `media_format_${media?.format}` as keyof Messages
                            )}
                        </Detail>
                    )}
                    {media?.title.native && (
                        <Detail title="Native Title">
                            {media?.title.native}
                        </Detail>
                    )}
                    {media?.title.romaji && (
                        <Detail title="Romaji Title">
                            {media?.title.romaji}
                        </Detail>
                    )}
                    {media?.title.english && (
                        <Detail title="English Title">
                            {media?.title.english}
                        </Detail>
                    )}
                    {media?.genres && (
                        <Detail title="Genres">
                            {media?.genres
                                .map((genre: MediaGenre) => {
                                    return m(
                                        `media_genre_${genre}` as keyof Messages
                                    );
                                })
                                .join(", ")}
                        </Detail>
                    )}
                    {media?.startDate && (
                        <Detail title="Start Date">
                            {media?.startDate.toDateString()}
                        </Detail>
                    )}
                    {media?.finishDate && (
                        <Detail title="Finish Date">
                            {media?.finishDate.toDateString()}
                        </Detail>
                    )}
                    {media?.status && (
                        <Detail title="Status">
                            {m(
                                `${media?.type}_status_${media?.status}` as keyof Messages
                            )}
                        </Detail>
                    )}
                    {media?.rating && (
                        <Detail title="Rating">
                            {m(
                                `media_rating_${media?.rating}` as keyof Messages
                            )}
                        </Detail>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function Detail({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="leading-none text-zinc-300 text-sm">{title}</div>
            <div className="text-xs text-zinc-400">{children}</div>
        </div>
    );
}
