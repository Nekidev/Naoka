import { AnimatePresence, motion } from "framer-motion";

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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed z-50 bg-zinc-950/50 w-full h-full top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center p-12"
                    onClick={() => closeModal()}
                >
                    <img
                        src={imageUrl}
                        className="max-h-full max-w-full rounded drop-shadow-2xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
