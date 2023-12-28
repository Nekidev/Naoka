"use client";

import React from "react";
import { Rubik } from "next/font/google";
import "./globals.css";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { useTheme } from "@/lib/settings";

const rubik = Rubik({ subsets: ["latin"] });

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

    return (
        <html lang="en" className={themeClass}>
            <head>
                <title>Naoka</title>
            </head>
            <body
                className={`${rubik.className}`}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            >
                {children}
            </body>
        </html>
    );
}
