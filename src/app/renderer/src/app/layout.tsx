import React from "react";
import { Rubik } from "next/font/google";
import SideBar from "@/components/SideBar";
import NavigationBar from "@/components/NavigationBar";
import "./globals.css";

const rubik = Rubik({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <title>Naoka</title>
            </head>
            <body className={`${rubik.className} flex flex-row w-screen`}>
                <SideBar />
                <div className="flex-1 relative h-screen max-h-screen overflow-y-hidden">
                    <NavigationBar />
                    {children}
                </div>
            </body>
        </html>
    );
}
