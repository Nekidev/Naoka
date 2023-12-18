"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function Link({
    href,
    children,
    ...props
}: {
    href: string;
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
                    router.push(href);
                }
            }}
            style={{
                cursor: "pointer",
                ...(props.style || {}),
            }}
            {...props}
        >
            {children}
        </div>
    );
}
