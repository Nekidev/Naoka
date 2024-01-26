"use client";

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation";

export default function Code() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Content />
        </Suspense>
    );
}

function Content() {
    const searchParams = useSearchParams();

    if (searchParams.get("status") !== "success") {
        return (
            <div>
                <h1>Something went wrong</h1>
                <p>
                    For some reason you couldn't be authenticated. You can close
                    this tab.
                </p>
                <p>
                    <i>
                        If the issue persists, ask for help in our Discord
                        server. You can find the link <a href="/">here</a>.
                    </i>
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Success!</h1>
            <p>Go back to Naoka and paste the following code:</p>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    gap: "0.5rem",
                    alignItems: "center",
                }}
            >
                <input
                    type="text"
                    disabled
                    style={{
                        flex: 1,
                        userSelect: "all",
                        MozUserSelect: "all",
                        WebkitUserSelect: "all"
                    }}
                    value={searchParams.get("code")}
                />
                <button
                    onClick={(e) => {
                        navigator.clipboard.writeText(searchParams.get("code"));
                        e.target.innerText = "Copied!";
                        setTimeout(() => {
                            e.target.innerText = "Copy to clipboard";
                        }, 3000);
                    }}
                >
                    Copy to clipboard
                </button>
            </div>
            <p>
                <i>You can close this tab after pasting the code in the app.</i>
            </p>
        </div>
    );
}
