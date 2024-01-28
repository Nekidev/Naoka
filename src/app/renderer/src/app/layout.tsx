"use client";

import React from "react";
import "./globals.css";
import { useIsClient } from "@uidotdev/usehooks";
import { useFont, useTheme } from "@/lib/settings";
import { db } from "@/lib/db";
import { ImportMethod } from "@/lib/db/types";

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
    const [theme, setTheme] = useTheme();

    let themeClass!: string;
    let darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    function systemThemeChangeHandler(e: MediaQueryListEvent) {
        setTheme(e.matches ? "dark" : "light");
    }

    switch (theme) {
        case "dark":
            themeClass = "dark";
            darkThemeMq.removeEventListener("change", systemThemeChangeHandler);
            break;

        case "light":
            themeClass = "light";
            darkThemeMq.removeEventListener("change", systemThemeChangeHandler);
            break;

        case "auto":
            themeClass = darkThemeMq.matches ? "dark" : "light";
            darkThemeMq.addEventListener("change", systemThemeChangeHandler);
            break;
    }

    const [font] = useFont();

    React.useEffect(() => {
        (async () => {
            const accounts = await db.externalAccounts.toArray();

            for (const account of accounts) {
                for (const mediaType of account.syncing) {
                    /**
                     * Not doing it with `Promise.all` because there will be
                     * errors with mappings being updated and collisions with
                     * library entries in case of being imported at the same
                     * time.
                     */
                    await account.importLibrary(
                        mediaType,
                        ImportMethod.Merge,
                        false
                    )
                }
            }

            console.log("All initial imports finished");
        })();
    }, []);

    return (
        <html lang="en" className={themeClass}>
            <head>
                <title>Naoka</title>
            </head>
            <body
                className={`font-${font}`}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            >
                {children}
            </body>
        </html>
    );
}
