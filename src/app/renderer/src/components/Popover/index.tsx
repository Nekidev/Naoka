"use client";

import React from "react";
import { useClickAway } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";

export default function Popover({
    content,
    enabled = true,
    position = "top",
    className = "",
    spacing = 1,
    children,
}: {
    content: React.ReactNode;
    enabled?: boolean;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    spacing?: number;
    children: React.ReactNode;
}) {
    const [isActive, setIsActive] = React.useState(false);
    const ref = useClickAway<HTMLDivElement>(() => setIsActive(false));

    let popoverStyle;

    switch (position) {
        case "top":
            popoverStyle = {
                bottom: `calc(100% + ${spacing}rem)`,
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;
        case "bottom":
            popoverStyle = {
                top: `calc(100% + ${spacing}rem)`,
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;
        case "left":
            popoverStyle = {
                right: `calc(100% + ${spacing}rem)`,
                top: "50%",
                transform: "translateY(-50%)",
            };
            break;
        case "right":
            popoverStyle = {
                left: `calc(100% + ${spacing}rem)`,
                top: "50%",
                transform: "translateY(-50%)",
            };
            break;
    }

    const animationHidden = {
        opacity: 0,
        ...(position == "top"
            ? { y: 10, x: "-50%" }
            : position == "bottom"
            ? { y: -10, x: "-50%" }
            : position == "left"
            ? { x: 10, y: "-50%" }
            : { x: -10, y: "-50%" }),
    };

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            onClick={() => setIsActive((v) => !v)}
        >
            {children}
            <AnimatePresence>
                {isActive && enabled && (
                    <motion.div
                        className="absolute m-auto bg-zinc-800 border border-zinc-700 z-50 h-fit w-fit text-sm leading-none rounded drop-shadow-xl"
                        style={popoverStyle}
                        initial={animationHidden}
                        animate={{
                            opacity: 1,
                            x: ["top", "bottom"].includes(position)
                                ? "-50%"
                                : 0,
                            y: ["left", "right"].includes(position)
                                ? "-50%"
                                : 0,
                        }}
                        exit={animationHidden}
                        transition={{
                            duration: 0.15,
                        }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
