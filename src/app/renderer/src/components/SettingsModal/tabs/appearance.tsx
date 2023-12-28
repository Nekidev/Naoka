"use client";

import { Header, Select, Setting } from "../components";
import { useTheme } from "@/lib/settings";
import { useLanguage } from "@/lib/messages";

export default function Appearance() {
    const [theme, setTheme] = useTheme();
    const [language, setLanguage] = useLanguage();

    return (
        <>
            <Header
                title="Appearance"
                subtitle="Customize the app's look and feel."
            />
            <Setting
                title="Theme"
                subtitle="This feature is experimental. Keep it in dark mode if you want everything to look nice."
            >
                <Select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <option value="dark">Dark</option>
                    <option value="light" disabled>Light</option>
                </Select>
            </Setting>
            <Setting title="Langauge" subtitle="Hello! Hola! こんいちは!">
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="en-US">🇺🇸 English</option>
                </Select>
            </Setting>
        </>
    );
}
