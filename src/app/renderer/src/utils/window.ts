import React from "react";


export async function toggleWindowMaximize(appWindow: any, status: boolean | null = null) {
    if (status === null) {
        if (await appWindow.isMaximized()) {
            document.body.classList.remove("maximized");
        } else {
            document.body.classList.add("maximized");
        }
        appWindow.toggleMaximize();
    } else {
        if (status) {
            document.body.classList.add("maximized");
            appWindow.maximize();
        } else {
            document.body.classList.remove("maximized");
            appWindow.unmaximize();
        }
    }
}

export function useMaximized(appWindow: any) {
    const [isMaximized, setIsMaximized] = React.useState(false);

    appWindow?.onResized(() => {
        (async () => {
            if (await appWindow.isMaximized()) {
                setIsMaximized(true);
            } else {
                setIsMaximized(false);
            }
        })();
    })

    return isMaximized;
}

export function useAppWindow() {
    const [appWindow, setAppWindow] = React.useState<any>();

    React.useEffect(() => {
        (async () => {
            const aw = (await import("@tauri-apps/api/window")).appWindow;
            setAppWindow(aw);
        })();
    }, []);

    return appWindow;
}
