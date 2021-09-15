import React, { useState } from "react";

import { Button, Dialog, Portal } from "react-native-paper";

import { Appbar } from "../../components/Appbar";
import { ScreenContainer } from "../../components/Common";
import { List } from "../../components/List";

import { useTheme } from "../../hooks/reduxHooks";
import { showToast } from "../../hooks/showToast";

import { deleteNovelCache } from "../../database/queries/NovelQueries";
import { clearUpdates } from "../../database/queries/UpdateQueries";

const AdvancedSettings = ({ navigation }) => {
    const theme = useTheme();

    /**
     * Confirm Clear Database Dialog
     */
    const [clearDatabaseDialog, setClearDatabaseDialog] = useState(false);
    const showClearDatabaseDialog = () => setClearDatabaseDialog(true);
    const hideClearDatabaseDialog = () => setClearDatabaseDialog(false);

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Advanced" onBackAction={() => navigation.goBack()} />
            <List.Section>
                <List.SubHeader theme={theme}>Data</List.SubHeader>
                <List.Item
                    title="Clear database"
                    description="Delete history for novels not in your library"
                    onPress={showClearDatabaseDialog}
                    theme={theme}
                />
                <List.Item
                    title="Clear updates tab"
                    description="Clears chapter entries in updates tab"
                    onPress={() => {
                        clearUpdates();
                        showToast("Updates cleared.");
                    }}
                    theme={theme}
                />
            </List.Section>
            <Portal>
                <Dialog
                    visible={clearDatabaseDialog}
                    onDismiss={hideClearDatabaseDialog}
                    style={{
                        borderRadius: 6,
                        backgroundColor: theme.colorPrimary,
                    }}
                >
                    <Dialog.Title
                        style={{
                            letterSpacing: 0,
                            fontSize: 16,
                            lineHeight: 16 * 1.5,
                            color: theme.textColorPrimary,
                        }}
                    >
                        Are you sure? Read chapters and progress of non-library
                        novels will be lost.
                    </Dialog.Title>
                    <Dialog.Actions>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={hideClearDatabaseDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={() => {
                                deleteNovelCache();
                                hideClearDatabaseDialog();
                            }}
                        >
                            Ok
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScreenContainer>
    );
};

export default AdvancedSettings;
