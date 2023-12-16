import { WebviewWindow } from "@tauri-apps/api/window";
import React from "react";

export async function toggleWindowMaximize(
    appWindow: WebviewWindow | undefined,
    status: boolean | null = null
) {
    if (status === null) {
        if (await appWindow?.isMaximized()) {
            document.body.classList.remove("maximized");
        } else {
            document.body.classList.add("maximized");
        }
        appWindow?.toggleMaximize();
    } else {
        if (status) {
            document.body.classList.add("maximized");
            appWindow?.maximize();
        } else {
            document.body.classList.remove("maximized");
            appWindow?.unmaximize();
        }
    }
}

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
