import React from "react";
import { motion } from "framer-motion";

export default function Modal({
    closeModal,
    children,
}: {
    closeModal: () => void;
    children: React.ReactNode;
}) {
    const containerRef = React.useRef<React.ElementRef<"div"> | null>(null);

    const handleEscapeKeyPress = (event: KeyboardEvent) => {
        const focusedElement = document.activeElement;

        if (
            event.key === "Escape" &&
            (!focusedElement || !containerRef.current?.contains(focusedElement))
        ) {
            closeModal();
        }
    };

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) =>
            handleEscapeKeyPress(event);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <motion.div
            ref={containerRef}
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
                className="rounded shadow-2xl"
                initial={{
                    translateY: 10,
                }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 10 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}