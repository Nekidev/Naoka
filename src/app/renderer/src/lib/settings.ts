import { useLocalStorage } from "@uidotdev/usehooks";
import { Dispatch, SetStateAction } from "react";
import { Media } from "./db/types";

/**
 * Retrieves and sets the theme preference from local storage.
 *
 * @return {string} The theme preference.
 */
export function useTheme() {
    return useLocalStorage("Naoka:Settings:Theme", "auto");
}

export function useTitleLanguage() {
    return useLocalStorage("Naoka:Settings:TitleLanguage", "english") as [
        "english" | "romaji" | "native",
        Dispatch<SetStateAction<"english" | "romaji" | "native">>
    ];
}

export function getMediaTitle(media: Media, lang?: "english" | "romaji" | "native"): string | undefined {
    if (!lang) {
        lang = useTitleLanguage()[0];
    }

    return (
        media.title[lang] ??
        media.title.romaji ??
        media.title.english ??
        media.title.native ??
        undefined
    );
}

export function useAdultFilter() {
    return useLocalStorage("Naoka:Settings:AdultFilter", true);
}
