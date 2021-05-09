import * as DocumentPicker from "expo-document-picker";
import { StorageAccessFramework } from "expo-file-system";

import { getLibrary } from "../Database/queries/LibraryQueries";
import { restoreLibrary } from "../Database/queries/NovelQueries";
import { showToast } from "../Hooks/showToast";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        };
    },
});

export const createBackup = async () => {
    const novels = await getLibrary();

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
        return;
    }

    const uri = permissions.directoryUri;

    if (uri) {
        const fileUri = await StorageAccessFramework.createFileAsync(
            uri,
            "backup",
            "application/json"
        );

        await StorageAccessFramework.writeAsStringAsync(
            fileUri,
            JSON.stringify(novels)
        );

        showToast("Backup created");
    }
};

export const restoreBackup = async () => {
    const backup = await DocumentPicker.getDocumentAsync();

    if (backup.uri) {
        let novels = await StorageAccessFramework.readAsStringAsync(backup.uri);
        novels = await JSON.parse(novels);

        novels.map((novel, index) => {
            restoreLibrary(novel);
<<<<<<< HEAD
=======
            if (index + 1 === novels.length) {
                Notifications.scheduleNotificationAsync({
                    content: { title: "Backup restored" },
                    trigger: null,
                });
            }
>>>>>>> 8f254b4ef52a9f5a8ce6d6ee1cbbb7d4c0e62d3d
        });
    }

    showToast("Backup restored. Restart your app.");
};
