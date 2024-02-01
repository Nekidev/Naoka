"use client";

import React from "react";
import "./globals.css";
import { useIsClient } from "@uidotdev/usehooks";
import { useFont, useTheme } from "@/lib/settings";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isClient = useIsClient();

    // Otherwise some client hooks will fail when hydrating server-side
    if (!isClient)
        return (
            <html>
                <body></body>
            </html>
        );

    return <Layout>{children}</Layout>;
}

function Layout({ children }: { children: React.ReactNode }) {
    const [theme] = useTheme();
    const [font] = useFont();

    return (
        <html lang="en" className={theme}>
            <head>
                <title>Naoka</title>
            </head>
            <body
                className={`font-${font}`}
                onContextMenu={(e) => {
                    if (process.env.NODE_ENV === "production") {
                        e.preventDefault();
                    }
                }}
            >
                {children}
            </body>
        </html>
    );
}
