import { AnimatePresence, motion } from "framer-motion";
import Modal from "../Modal";

export default function ImageModal({
    imageUrl,
    closeModal,
}: {
    imageUrl: string | null;
    closeModal: () => void;
}) {
    return (
        <AnimatePresence>
            {imageUrl && (
                <Modal closeModal={closeModal}>
                    <img
                        src={imageUrl}
                        className="max-h-full max-w-full rounded drop-shadow-2xl"
                    />
                </Modal>
            )}
        </AnimatePresence>
    );
}
