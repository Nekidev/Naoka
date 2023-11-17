"use client";

import React from "react";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import SideBar from "@/components/SideBar";
import NavigationBar from "@/components/NavigationBar";
import NavigationBarContext from "@/contexts/NavigationBarContext";
import "./globals.css";

const rubik = Rubik({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [extraComponent, setExtraComponent] = React.useState<JSX.Element>(<></>);

    return (
        <html lang="en">
            <body className={`${rubik.className} flex flex-row w-screen`}>
                <NavigationBarContext.Provider value={{
                    extraComponent,
                    setExtraComponent
                }}>
                    <SideBar />
                    <div className="flex-1 relative h-screen overflow-y-auto">
                        <NavigationBar />
                        {children}
                    </div>
                </NavigationBarContext.Provider>
            </body>
        </html>
    );
}
