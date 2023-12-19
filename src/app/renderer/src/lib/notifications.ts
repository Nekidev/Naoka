import {
    Options,
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/api/notification";

export async function notify(options: Options, askForPermission: boolean = true) {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted && askForPermission) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
        sendNotification(options);
    }
}
