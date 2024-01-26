import React from "react";

import { Window, getCurrent } from "@tauri-apps/plugin-window";

export enum MaximixedStatus {
    Toggle,
    Maximized,
    UnMaximized,
}

/**
 * Sets the maximized state of the app window.
 *
 * @param {MaximixedStatus} status - The desired maximize state.
 */
export async function setWindowMaximizedStatus(
    status: MaximixedStatus = MaximixedStatus.Toggle
) {
    const appWindow = getCurrent();

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
 * @return {boolean} The boolean value indicating whether the appWindow is maximized.
 */
export function useMaximized(): boolean {
    const [isMaximized, setIsMaximized] = React.useState(false);

    const update = async (appWindow: Window) => {
        if (await appWindow?.isMaximized()) {
            setIsMaximized(true);
        } else {
            setIsMaximized(false);
        }
    };

    React.useEffect(() => {
        (async () => {
            if ("__TAURI__" in window) {
                const appWindow = getCurrent();

                appWindow?.onResized(() => {
                    update(appWindow);
                });

                update(appWindow);
            }
        })();
    }, []);

    return isMaximized;
}
