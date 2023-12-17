"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Tooltip({
    label,
    enabled = true,
    position = "top",
    className = "",
    spacing = 1,
    children,
}: {
    label: string;
    enabled?: boolean;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    spacing?: number;
    children: React.ReactNode;
}) {
    const [isActive, setIsActive] = React.useState(false);

    let tooltipStyle;

    switch (position) {
        case "top":
            tooltipStyle = {
                bottom: `calc(100% + ${spacing}rem)`,
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;
        case "bottom":
            tooltipStyle = {
                top: `calc(100% + ${spacing}rem)`,
                left: "50%",
                transform: "translateX(-50%)",
            };
            break;
        case "left":
            tooltipStyle = {
                right: `calc(100% + ${spacing}rem)`,
                top: "50%",
                transform: "translateY(-50%)",
            };
            break;
        case "right":
            tooltipStyle = {
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
            className={`relative w-fit h-fit ${className}`}
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
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
