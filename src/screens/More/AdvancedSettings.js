import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { ScreenContainer } from "../../components/Common";
import { ListItem, ListSection, ListSubHeader } from "../../components/List";

import { useTheme } from "../../hooks/reduxHooks";

import { clearAllHistoryAction } from "../../redux/history/history.actions";
import { deleteNovelCache } from "../../database/queries/NovelQueries";
import { Button, Dialog, Portal } from "react-native-paper";

const AdvancedSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [visible, setVisible] = useState(false);
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    /**
     * Confirm Clear Database Dialog
     */
    const [clearDatabaseDialog, setClearDatabaseDialog] = useState(false);
    const showClearDatabaseDialog = () => setClearDatabaseDialog(true);
    const hideClearDatabaseDialog = () => setClearDatabaseDialog(false);

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Advanced" onBackAction={() => navigation.goBack()} />
            <ListSection>
                <ListSubHeader theme={theme}>Data</ListSubHeader>
                <ListItem
                    title="Clear database"
                    description="Delete history for novels not in your library"
                    onPress={showClearDatabaseDialog}
                    theme={theme}
                />
                <ListItem
                    title="Clear history"
                    description="Delete reading history for all novels"
                    onPress={showDialog}
                    theme={theme}
                />
            </ListSection>
            <Portal>
                <Dialog
                    visible={visible}
                    onDismiss={hideDialog}
                    style={{
                        borderRadius: 6,
                        backgroundColor: theme.colorPrimary,
                    }}
                >
                    <Dialog.Title
                        style={{
                            letterSpacing: 0,
                            fontSize: 16,
                            color: theme.textColorPrimary,
                        }}
                    >
                        Are you sure? All history will be lost.
                    </Dialog.Title>
                    <Dialog.Actions>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={hideDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={() => {
                                dispatch(clearAllHistoryAction());
                                hideDialog();
                            }}
                        >
                            Ok
                        </Button>
                    </Dialog.Actions>
                </Dialog>
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
