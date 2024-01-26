"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { open } from "@tauri-apps/plugin-shell";

export default function Link({
    href,
    children,
    target,
    ...props
}: {
    href: string;
    target?: string;
    children: React.ReactNode;
    [key: string]: any;
}) {
    const router = useRouter();

    return (
        <div
            onClick={(e) => {
                var followLink = true;

                e.preventDefault = () => {
                    followLink = false;
                };

                props.onClick && props.onClick(e);

                if (followLink) {
                    if (target === "_blank") {
                        open(href);
                    } else {
                        router.push(href);
                    }
                }
            }}
            style={{
                cursor: "pointer",
                width: "fit-content",
                display: "inline-block",
                ...(props.style || {}),
            }}
            {...props}
        >
            {children}
        </div>
    );
}
