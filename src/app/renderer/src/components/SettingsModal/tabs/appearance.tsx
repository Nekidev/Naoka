"use client";

import { Header, Select, Setting } from "../components";
import { useTheme, useTitleLanguage } from "@/lib/settings";
import { Language, useLanguage, useMessages } from "@/lib/messages";
import { languages } from "../../../lib/messages";
import { Messages } from "@/lib/messages/translations";

export default function Appearance() {
    const m = useMessages();

    const [theme, setTheme] = useTheme();
    const [language, setLanguage] = useLanguage();
    const [titleLanguage, setTitleLanguage] = useTitleLanguage();

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
            <Setting
                title={m("settings_appearance_titlelanguage_title")}
                subtitle={m("settings_appearance_titlelanguage_subtitle")}
                >
                    <Select
                        value={titleLanguage}
                        onChange={(e) => setTitleLanguage(e.target.value)}
                    >
                        <option value="english">
                            {m("settings_appearance_titlelanguage_english")} (High-Rise Invasion)
                        </option>
                        <option value="romaji">
                            {m("settings_appearance_titlelanguage_romaji")} (Tenkuu Shinpan)
                        </option>
                        <option value="native">
                            {m("settings_appearance_titlelanguage_native")} (天空侵犯)
                        </option>
                    </Select>
                </Setting>
        </>
    );
}
