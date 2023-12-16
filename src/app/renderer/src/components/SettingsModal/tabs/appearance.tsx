"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import { Select, Setting } from "../components";

export default function Appearance() {
    const [theme, setTheme] = useLocalStorage("Naoka:Settings:Theme", "dark");
    const [language, setLanguage] = useLocalStorage(
        "Naoka:Settings:Language",
        "en"
    );

    return (
        <>
            <div className="flex flex-col gap-2">
                <h1 className="text-xl leading-none">Appearance</h1>
                <div className="text-zinc-400 text-sm">
                    Customize the app's look and feel.
                </div>
            </div>
            <Setting
                title="Theme"
                subtitle="This feature is experimental. Keep it in dark mode if you want everything to look nice."
            >
                <Select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                </Select>
            </Setting>
            <Setting title="Langauge" subtitle="Hello! Hola! こんいちは!">
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="en">🇺🇸 English</option>
                </Select>
            </Setting>
        </>
    );
}
