"use client";

import { Header, Select, Setting } from "../components";
import { useTheme } from "@/lib/settings";
import { Language, useLanguage, useMessages } from "@/lib/messages";
import { languages } from "../../../lib/messages";

export default function Appearance() {
    const m = useMessages();

    const [theme, setTheme] = useTheme();
    const [language, setLanguage] = useLanguage();

    return (
        <>
            <Header
                title={m("settings_appearance_title")}
                subtitle={m("settings_appearance_subtitle")}
            />
            <Setting
                title={m("settings_appearance_theme_title")}
                subtitle={m("settings_appearance_theme_subtitle")}
            >
                <Select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <option value="auto">
                        {m("settings_appearance_theme_system")}
                    </option>
                    <option value="dark">
                        {m("settings_appearance_theme_dark")}
                    </option>
                    <option value="light" disabled>
                        {m("settings_appearance_theme_light")}
                    </option>
                </Select>
            </Setting>
            <Setting
                title={m("settings_appearance_language_title")}
                subtitle={m("settings_appearance_language_subtitle")}
            >
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.emoji} {lang.name}
                        </option>
                    ))}
                </Select>
            </Setting>
        </>
    );
}
