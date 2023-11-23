import { Mapping } from "@/lib/types";

export default function LibraryEntryModal({
    mapping,
    closeModal,
}: {
    mapping: Mapping | null;
    closeModal: () => void;
}) {
    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-zinc-950/50" onClick={closeModal}>
            <div className="absolute top-0 bottom-0 left-0 right-0" onClick={closeModal}></div>
        </div>
    );
}
