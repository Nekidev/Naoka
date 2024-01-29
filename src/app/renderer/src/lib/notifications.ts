import {
    Options,
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/api/notification";

/**
 * Send a notification to the user with a given set of options, asking for
 * permission if necessary. This will be replaced with in-app notifications if
 * #173 is implemented.
 * 
 * #173: https://github.com/Nekidev/Naoka/issues/173
 *
 * @param {Options} options the options for the notification
 * @param {boolean} askForPermission flag to indicate whether to ask for permission
 * @return {Promise<void>} a promise that resolves when the notification is sent
 */
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
