import React from "react";
import { useLocalStorage, usePreferredLanguage } from "@uidotdev/usehooks";
import defaultMessages from "./translations/en-US";
import { Messages } from "./translations";

export type Language = {
    code: string;
    name: string;
    emoji: string;
};

export const languages: Language[] = [
    {
        code: "en-US",
        name: "English",
        emoji: "🇺🇸",
    },
    {
        code: "es-AR",
        name: "Español",
        emoji: "🇦🇷",
    }
];

/**
 * Retrieves the preferred language from the user and determines the default language to be used.
 *
 * @return {string} The default language to be used.
 */
export function useLanguage() {
    const preferredLanguage = usePreferredLanguage()
        .split("-")[0]
        .toLowerCase();

    let defaultLanguage;
    if (preferredLanguage in languages) {
        defaultLanguage = preferredLanguage;
    } else {
        defaultLanguage = languages
            .map((lang: Language) => lang.code.split("-")[0])
            .find(
                (lang: string) =>
                    lang.split("-")[0].toLowerCase() ===
                    preferredLanguage.split("-")[0].toLowerCase()
            );
    }

    return useLocalStorage("Naoka:Settings:Language", defaultLanguage ?? "en-US");
}

export function useMessages() {
    const [language] = useLanguage();
    const [messages, setMessages] = React.useState<undefined | any>();

    React.useEffect(() => {
        (async () => {
            setMessages((await require(`./translations/${language}`)).default);
        })();
    }, [language]);

    return (code: keyof Messages, options: { [key: string]: any } = {}): string => {
        let message = messages?.[code] ?? defaultMessages[code] ?? code;

        Object.getOwnPropertyNames(options).forEach((key) => {
            message = message.replace(`{${key}}`, options[key]);
        })

        return message;
    };
}
