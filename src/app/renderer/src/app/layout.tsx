"use client";

import React from "react";
import { Rubik } from "next/font/google";
import "./globals.css";
import SideBarContext from "@/contexts/SideBarContext";
import { useLocalStorage } from "@uidotdev/usehooks";

const rubik = Rubik({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [_isExpanded, _setIsExpanded] = useLocalStorage("Naoka:SideBar:Expanded", "true");
    const [theme, setTheme] = useLocalStorage("Naoka:Settings:Theme", "dark");

    const setIsExpanded = (isExpanded: boolean) => {
        _setIsExpanded(isExpanded.toString());
    };

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
                <SideBarContext.Provider
                    value={{
                        isExpanded: _isExpanded == "true",
                        setIsExpanded,
                    }}
                >
                    {children}
                </SideBarContext.Provider>
            </body>
        </html>
    );
}
