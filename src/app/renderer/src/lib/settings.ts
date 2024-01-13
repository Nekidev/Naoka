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

/**
 * A hook that retrieves the title language preference from local storage.
 *
 * @return {["english" | "romaji" | "native", Dispatch<SetStateAction<"english" | "romaji" | "native">>]} The title language preference and a function to update it.
 */
export function useTitleLanguage() {
    return useLocalStorage("Naoka:Settings:TitleLanguage", "english") as [
        "english" | "romaji" | "native",
        Dispatch<SetStateAction<"english" | "romaji" | "native">>
    ];
}

/**
 * Retrieves the title of a media in the specified or otherwise preferred language.
 *
 * @param {Media} media - The media object.
 * @param {("english" | "romaji" | "native")=} lang - The language to retrieve the title in. Default is the user's preferred title language.
 * @return {string | undefined} - The title of the media in the specified language, or undefined if the title is not available.
 */
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

/**
 * Retrieves and sets the adult filter preference from local storage.
 *
 * @return {boolean} The adult filter preference.
 */
export function useAdultFilter() {
    return useLocalStorage("Naoka:Settings:AdultFilter", true);
}

/**
 * Retrieves and sets the font preference from local storage.
 *
 * @return {string} The font preference.
 */
export function useFont() {
    return useLocalStorage("Naoka:Settings:Font", "rubik");
}