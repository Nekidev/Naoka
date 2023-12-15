"use client";

import React from "react";
import { Rubik } from "next/font/google";
import "./globals.css";
import SideBarContext from "@/contexts/SideBarContext";

const rubik = Rubik({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isExpanded, setIsExpanded] = React.useState(
        false
    );

    return (
        <html lang="en">
            <head>
                <title>Naoka</title>
            </head>
            <body
                className={`${rubik.className} flex flex-row w-screen`}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            >
                <SideBarContext.Provider
                    value={{
                        isExpanded,
                        setIsExpanded,
                    }}
                >
                    {children}
                </SideBarContext.Provider>
            </body>
        </html>
    );
}
