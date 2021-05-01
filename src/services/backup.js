import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { getLibrary } from "../database/queries/LibraryQueries";
import { restoreLibrary } from "../database/queries/NovelQueries";
import { showToast } from "../Hooks/showToast";
import * as DocumentPicker from "expo-document-picker";

export const createBackup = async () => {
    const novels = await getLibrary();

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    const uri = permissions.directoryUri;

    const fileUri = await StorageAccessFramework.createFileAsync(
        uri,
        "backup.json"
    );

    await StorageAccessFramework.writeAsStringAsync(
        fileUri,
        JSON.stringify(novels)
    );
    showToast("Backup created");
};

export const restoreBackup = async () => {
    const backup = await DocumentPicker.getDocumentAsync();

    let novels = await StorageAccessFramework.readAsStringAsync(backup.uri);

    novels = await JSON.parse(novels);

    await novels.map((novel) => restoreLibrary(novel));

    showToast("Restored backup");
};
