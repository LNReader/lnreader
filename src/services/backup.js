import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";

import { getLibrary } from "../database/queries/LibraryQueries";
import { restoreLibrary } from "../database/queries/NovelQueries";
import { showToast } from "../Hooks/showToast";

export const createBackup = async () => {
    const novels = await getLibrary();

    if (Platform.constants.Release >= 10) {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

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
    } else {
        let uri = FileSystem.documentDirectory;
        let fileUri = uri + "LNReader";

        let folderExists = await FileSystem.getInfoAsync(fileUri);

        if (!folderExists) {
            await FileSystem.makeDirectoryAsync(fileUri);
        }

        await FileSystem.writeAsStringAsync(
            fileUri + "/backup.json",
            JSON.stringify(novels)
        );

        showToast("Backup created");
    }
};

export const restoreBackup = async () => {
    const backup = await DocumentPicker.getDocumentAsync();

    if (backup.uri) {
        let novels = await FileSystem.readAsStringAsync(backup.uri);
        novels = await JSON.parse(novels);
        await novels.map((novel) => restoreLibrary(novel));
        showToast("Restored backup");
    }
};
