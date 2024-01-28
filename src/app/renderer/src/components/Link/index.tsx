"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { open } from "@tauri-apps/api/shell";

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
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                
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
            {...props}
        >
            {children}
        </a>
    );
}
