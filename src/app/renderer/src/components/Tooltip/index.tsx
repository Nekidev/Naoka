import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Tooltip({
    label,
    enabled = true,
    position = "top",
    className = "",
    children,
}: {
    label: string;
    enabled?: boolean;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    children: React.ReactNode;
}) {
    const [isActive, setIsActive] = React.useState(false);

    let tooltipStyle;

    switch (position) {
        case "top":
            tooltipStyle = {
                bottom: "calc(100% + 1rem)",
                left: 0,
                right: 0,
            };
        case "bottom":
            tooltipStyle = {
                top: "calc(100% + 1rem)",
                left: 0,
                right: 0,
            };
        case "left":
            tooltipStyle = {
                top: 0,
                bottom: 0,
                right: "calc(100% + 1rem)",
            };
        case "right":
            tooltipStyle = {
                top: 0,
                bottom: 0,
                left: "calc(100% + 1rem)",
            };
    }

    const animationHidden = {
        opacity: 0,
        ...(position == "top"
            ? { y: 10 }
            : position == "bottom"
            ? { y: -10 }
            : position == "left"
            ? { x: 10 }
            : { x: -10 }),
    };

    return (
        <div
            className={`relative w-fit h-fit flex flex-col items-center justify-center ${className}`}
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
        >
            {children}
            <AnimatePresence>
                {isActive && enabled && (
                    <motion.div
                        className="absolute m-auto whitespace-nowrap bg-zinc-800 border border-zinc-700 z-50 h-fit w-fit text-sm leading-none p-1 rounded drop-shadow-xl pointer-events-none"
                        style={tooltipStyle}
                        initial={animationHidden}
                        animate={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                        }}
                        exit={animationHidden}
                        transition={{
                            duration: 0.15,
                        }}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
