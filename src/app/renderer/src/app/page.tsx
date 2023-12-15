"use client";

export default function Splashscreen() {
    return (
        <main className="h-full w-full bg-zinc-950 flex flex-col items-stretch">
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <img
                    src="/icon.jpg"
                    className="h-16 w-16 rounded object-center object-cover"
                />
                <h1 className="text-xl leading-none">Naoka</h1>
            </div>
            <div className="flex flex-col items-stretch">
                <div className="text-sm text-zinc-500 leading-none p-2 text-left">
                    Checking for updates...
                </div>
                <ProgressBar progress={1} total={2} />
            </div>
        </main>
    );
}

function ProgressBar({ progress, total }: { progress: number; total: number }) {
    return (
        <div className="bg-zinc-800 h-1 relative">
            <div
                className="h-full bg-zinc-100 transition ease-out"
                style={{
                    width: `${(progress / total) * 100}%`,
                }}
            ></div>
        </div>
    );
}
