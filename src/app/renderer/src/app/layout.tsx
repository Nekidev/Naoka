"use client";

import React from "react";
import { Rubik } from "next/font/google";
import "./globals.css";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";

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
    const [theme, setTheme] = useLocalStorage("Naoka:Settings:Theme", "dark");

    return (
        <html lang="en" className={theme}>
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
