import * as DocumentPicker from "expo-document-picker";
import { StorageAccessFramework } from "expo-file-system";

import { getLibrary } from "../Database/queries/LibraryQueries";
import { restoreLibrary } from "../Database/queries/NovelQueries";
import { showToast } from "../Hooks/showToast";

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
        await novels.map((novel) => restoreLibrary(novel));
        showToast("Restored backup");
    }
};
