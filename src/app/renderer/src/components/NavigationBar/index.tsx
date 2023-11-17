"use client";

import React from "react";
import NavigationBarContext from "@/contexts/NavigationBarContext";

export default function NavigationBar(): JSX.Element {
    const { extraComponent, setExtraComponent } =
        React.useContext(NavigationBarContext);

    return (
        <div className="sticky top-0 left-0 right-0 flex flex-row items-center">
            <div className="flex flex-row items-center gap-4 p-4">
                <button
                    className="hover:text-white"
                    onClick={() => {
                        window.history.back();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>
                <button
                    className="hover:text-white"
                    onClick={() => {
                        window.history.forward();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
            {extraComponent}
        </div>
    );
}
