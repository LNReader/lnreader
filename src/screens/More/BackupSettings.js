import React from "react";
import { useDispatch } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { List } from "../../components/List";
import { ScreenContainer } from "../../components/Common";

import { useTheme } from "../../hooks/reduxHooks";
import { restoreLibraryAction } from "../../redux/library/library.actions";
import { createBackup } from "../../services/backup";

const BackupSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <>
            <ScreenContainer theme={theme}>
                <Appbar
                    title="Backup"
                    onBackAction={() => navigation.goBack()}
                />
                <List.Section>
                    <List.SubHeader theme={theme}>Backup</List.SubHeader>
                    <List.Item
                        title="Create backup"
                        description="Can be used to restore current library"
                        onPress={createBackup}
                        theme={theme}
                    />
                    <List.Item
                        title="Restore backup"
                        description="Restore library from backup file"
                        onPress={() => dispatch(restoreLibraryAction())}
                        theme={theme}
                    />
                    <List.InfoItem
                        title="Create backup may not work on devices with Android 9 or lower."
                        icon="information-outline"
                        description="Restore library from backup file"
                        theme={theme}
                    />
                </List.Section>
            </ScreenContainer>
        </>
    );
};

export default BackupSettings;
