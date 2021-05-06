import React, { useState } from "react";
import { View } from "react-native";
import { connect, useDispatch } from "react-redux";

import { switchTheme } from "../../redux/settings/settings.actions";
import {
    setDisplayMode,
    setItemsPerRow,
} from "../../redux/settings/settings.actions";
import { deleteAllHistory } from "../../Database/queries/HistoryQueries";
import { deleteNovelCache } from "../../Database/queries/NovelQueries";

import { Appbar } from "../../Components/Appbar";
import {
    Divider,
    ListItem,
    ListSection,
    ListSubHeader,
    InfoItem,
} from "../../Components/List";
import DisplayModeModal from "./components/DisplayModeModal";
import GridSizeModal from "./components/GridSizeModal";
import ThemeModal from "./components/ThemeModal";
import { createBackup, restoreBackup } from "../../Services/backup";
import { useTheme } from "../../Hooks/reduxHooks";
import { restoreLibraryAction } from "../../redux/library/library.actions";

const SettingsScreen = ({
    navigation,
    displayMode,
    itemsPerRow,
    switchTheme,
    setDisplayMode,
    setItemsPerRow,
}) => {
    const displayModeLabel = (displayMode) => {
        const label = {
            0: "Compact Grid",
            1: "Comfortable Grid",
            2: "List",
        };

        return label[displayMode];
    };

    const theme = useTheme();

    const dispatch = useDispatch();

    // Display Mode Modal
    const [displayModalVisible, setDisplayModalVisible] = useState(false);
    const showDisplayModal = () => setDisplayModalVisible(true);
    const hideDisplayModal = () => setDisplayModalVisible(false);

    // Theme Modal
    const [themeModalVisible, setthemeModalVisible] = useState(false);
    const showthemeModal = () => setthemeModalVisible(true);
    const hidethemeModal = () => setthemeModalVisible(false);

    // Grid Size Modal
    const [gridSizeModalVisible, setGridSizeModalVisible] = useState(false);
    const showGridSizeModal = () => setGridSizeModalVisible(true);
    const hideGridSizeModal = () => setGridSizeModalVisible(false);

    return (
        <>
            <Appbar title="Settings" onBackAction={() => navigation.goBack()} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colorPrimaryDark,
                    paddingVertical: 8,
                }}
            >
                <ListSection>
                    <ListSubHeader theme={theme}>Data</ListSubHeader>
                    <ListItem
                        title="Clear database"
                        description="Delete history for novels not in your library"
                        onPress={() => deleteNovelCache()}
                        theme={theme}
                    />
                    <ListItem
                        title="Clear history"
                        description="Delete reading history for all novels"
                        onPress={() => deleteAllHistory()}
                        theme={theme}
                    />
                    <Divider theme={theme} />
                    <ListSubHeader theme={theme}>Display</ListSubHeader>
                    <ListItem
                        title="Display Mode"
                        description={displayModeLabel(displayMode)}
                        onPress={showDisplayModal}
                        theme={theme}
                    />
                    <ListItem
                        title="Items per row in library"
                        description={`${itemsPerRow} items per row`}
                        onPress={showGridSizeModal}
                        theme={theme}
                    />
                    <Divider theme={theme} />
                    <ListSubHeader theme={theme}>Theme</ListSubHeader>
                    <ListItem
                        title="Theme"
                        description={theme.name}
                        onPress={showthemeModal}
                        theme={theme}
                    />
                    <Divider theme={theme} />
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
                <DisplayModeModal
                    displayMode={displayMode}
                    displayModalVisible={displayModalVisible}
                    hideDisplayModal={hideDisplayModal}
                    setDisplayMode={setDisplayMode}
                    theme={theme}
                />
                <GridSizeModal
                    itemsPerRow={itemsPerRow}
                    gridSizeModalVisible={gridSizeModalVisible}
                    hideGridSizeModal={hideGridSizeModal}
                    setItemsPerRow={setItemsPerRow}
                    theme={theme}
                />
                <ThemeModal
                    themeModalVisible={themeModalVisible}
                    hidethemeModal={hidethemeModal}
                    switchTheme={switchTheme}
                    theme={theme}
                />
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    displayMode: state.settingsReducer.displayMode,
    itemsPerRow: state.settingsReducer.itemsPerRow,
});

export default connect(mapStateToProps, {
    switchTheme,
    setDisplayMode,
    setItemsPerRow,
})(SettingsScreen);
