import NavigationBar from "@/components/NavigationBar";
import SideBar from "@/components/SideBar";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-stretch w-screen h-screen max-h-screen">
            <div className="flex flex-row items-stretch flex-1 max-h-screen">
                <SideBar />
                <div className="flex-1 relative overflow-y-hidden bg-zinc-900">
                    <NavigationBar />
                    {children}
                </div>
            </div>
        </div>
    );
}
