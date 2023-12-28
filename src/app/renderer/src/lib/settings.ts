import { useLocalStorage } from "@uidotdev/usehooks";

/**
 * Retrieves and sets the theme preference from local storage.
 *
 * @return {string} The theme preference.
 */
export function useTheme() {
    return useLocalStorage(
        "Naoka:Settings:Theme",
        "auto"
    );
}
