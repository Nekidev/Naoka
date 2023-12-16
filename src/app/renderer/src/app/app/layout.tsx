import NavigationBar from "@/components/NavigationBar";
import SideBar from "@/components/SideBar";
import SideBarContext from "@/contexts/SideBarContext";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SideBar />
            <div className="flex-1 relative h-screen max-h-screen overflow-y-hidden bg-zinc-900">
                <NavigationBar />
                {children}
            </div>
        </>
    );
}
