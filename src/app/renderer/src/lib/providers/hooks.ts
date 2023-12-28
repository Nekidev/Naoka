import { useLocalStorage } from "@uidotdev/usehooks";
import { Provider } from "../db/types";

export function useSelectedProvider(
    defaultValue: Provider = "anilist"
): [Provider, (value: Provider) => void] {
    return useLocalStorage("Naoka:Provider:Selected", defaultValue);
}
