import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";

export default function ConfirmModal({
    isOpen,
    title,
    content,
    onConfirm,
    onDecline = () => {},
    closeModal,
}: {
    isOpen: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    onDecline?: () => void;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <Modal closeModal={closeModal}>
                    <div className="w-screen max-w-lg bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-4">
                        <h2 className="text-xl leading-none">{title}</h2>
                        <div className="text-zinc-300">{content}</div>
                        <div className="flex flex-row items-center gap-2 justify-end">
                            <button
                                className="py-2 px-4 leading-none rounded transition text-zinc-300 bg-zinc-700 hover:bg-zinc-600"
                                onClick={() => {
                                    onDecline();
                                    closeModal();
                                }}
                            >
                                Decline
                            </button>
                            <button
                                className="py-2 px-4 leading-none rounded transition text-zinc-900 bg-zinc-100 hover:bg-zinc-300 disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:cursor-not-allowed"
                                onClick={() => {
                                    onConfirm();
                                    closeModal();
                                }}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>
    );
}
