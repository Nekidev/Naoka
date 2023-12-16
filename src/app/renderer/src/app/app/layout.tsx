"use client";

import NavigationBar from "@/components/NavigationBar";
import SideBar from "@/components/SideBar";
import SideBarContext from "@/contexts/SideBarContext";
import { useAppWindow } from "@/utils/window";
import { LogicalSize } from "@tauri-apps/api/window";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { setIsExpanded } = React.useContext(SideBarContext);

    React.useEffect(() => {
        setIsExpanded(
            window.localStorage.getItem("Naoka:SideBar:isExpanded") == "true"
        );
    }, []);

    return (
        <>
            <SideBar />
            <div className="flex-1 relative h-screen max-h-screen overflow-y-hidden">
                <NavigationBar />
                {children}
            </div>
        </>
    );
}
