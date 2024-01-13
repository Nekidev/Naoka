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
    if (!isClient) return <html><body></body></html>;

    return <Layout>{children}</Layout>;
}

function Layout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useTheme();

    let themeClass!: string;
    let darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    function systemThemeChangeHandler (e: MediaQueryListEvent) {
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
