import React from "react";

import { WebviewWindow } from "@tauri-apps/api/window";

export enum MaximixedStatus {
    Toggle,
    Maximized,
    UnMaximized,
}

/**
 * Sets the maximized state of the app window.
 *
 * @param {WebviewWindow | undefined} appWindow - The app window to toggle.
 * @param {MaximixedStatus} status - The desired maximize state.
 */
export async function setWindowMaximizedStatus(
    appWindow: WebviewWindow | undefined,
    status: MaximixedStatus = MaximixedStatus.Toggle
) {
    if (status === MaximixedStatus.Toggle) {
        if (await appWindow?.isMaximized()) {
            document.body.classList.remove("maximized");
        } else {
            document.body.classList.add("maximized");
        }
        appWindow?.toggleMaximize();
    } else {
        if (status === MaximixedStatus.Maximized) {
            document.body.classList.add("maximized");
            appWindow?.maximize();
        } else {
            document.body.classList.remove("maximized");
            appWindow?.unmaximize();
        }
    }
}

/**
 * Returns a boolean value indicating whether the given appWindow is maximized.
 *
 * @param {WebviewWindow | undefined} appWindow - The window to check for maximization.
 * @return {boolean} The boolean value indicating whether the appWindow is maximized.
 */
export function useMaximized(appWindow: WebviewWindow | undefined) {
    const [isMaximized, setIsMaximized] = React.useState(false);

    const update = async () => {
        if (await appWindow?.isMaximized()) {
            setIsMaximized(true);
        } else {
            setIsMaximized(false);
        }
    };

    appWindow?.onResized(() => {
        update();
    });
    update();

    return isMaximized;
}

/**
 * Retrieves the Tauri application window.
 *
 * @returns {WebviewWindow | undefined} The application window if found, otherwise undefined.
 */
export function useAppWindow(): WebviewWindow | undefined {
    const [appWindow, setAppWindow] = React.useState<
        WebviewWindow | undefined
    >();

    React.useEffect(() => {
        (async () => {
            const aw = (await import("@tauri-apps/api/window")).appWindow;
            setAppWindow(aw);
        })();
    }, []);

    return appWindow;
}
