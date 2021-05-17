import React from "react";
import { useDispatch } from "react-redux";

import { Appbar } from "../../Components/Appbar";
import {
    InfoItem,
    ListItem,
    ListSection,
    ListSubHeader,
} from "../../Components/List";
import { ScreenContainer } from "../../Components/Common";

import { useTheme } from "../../Hooks/reduxHooks";
import { restoreLibraryAction } from "../../redux/library/library.actions";
import { createBackup } from "../../Services/backup";

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
                <ListSection>
                    <ListSubHeader theme={theme}>Backup</ListSubHeader>
                    <ListItem
                        title="Create backup"
                        description="Can be used to restore current library"
                        onPress={createBackup}
                        theme={theme}
                    />
                    <ListItem
                        title="Restore backup"
                        description="Restore library from backup file"
                        onPress={() => dispatch(restoreLibraryAction())}
                        theme={theme}
                    />
                    <InfoItem
                        title="Create backup may not work on devices with Android 9 or lower."
                        icon="information-outline"
                        description="Restore library from backup file"
                        theme={theme}
                    />
                </ListSection>
            </ScreenContainer>
        </>
    );
};

export default BackupSettings;
