"use client";

import { useAdultFilter, useTitleLanguage } from "@/lib/settings";
import { Header, Select, Setting } from "../components";
import { useMessages } from "@/lib/messages";

export default function Media() {
    const m = useMessages();

    const [titleLanguage, setTitleLanguage] = useTitleLanguage();
    const [adultFilter, setAdultFilter] = useAdultFilter();

    return (
        <>
            <Header
                title={m("settings_media_title")}
                subtitle={m("settings_media_subtitle")}
            />
            <Setting
                title={m("settings_media_titlelanguage_title")}
                subtitle={m("settings_media_titlelanguage_subtitle")}
            >
                <Select
                    value={titleLanguage}
                    onChange={(e) => setTitleLanguage(e.target.value)}
                >
                    <option value="english">
                        {m("settings_media_titlelanguage_english")} (High-Rise
                        Invasion)
                    </option>
                    <option value="romaji">
                        {m("settings_media_titlelanguage_romaji")} (Tenkuu
                        Shinpan)
                    </option>
                    <option value="native">
                        {m("settings_media_titlelanguage_native")} (天空侵犯)
                    </option>
                </Select>
            </Setting>
            <Setting
                title={m("settings_media_adultfilter_title")}
                subtitle={m("settings_media_adultfilter_subtitle")}
                >
                    <Select value={adultFilter} onChange={(e) => setAdultFilter(e.target.value == "true")}>
                        <option value="true">
                            {m("settings_media_adultfilter_true")}
                        </option>
                        <option value="false">
                            {m("settings_media_adultfilter_false")}
                        </option>
                    </Select>
                </Setting>
        </>
    );
}
