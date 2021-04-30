import React, { useState } from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import { switchTheme } from "../../redux/theme/theme.actions";
import {
    setDisplayMode,
    setItemsPerRow,
} from "../../redux/settings/settings.actions";
import { deleteAllHistory } from "../../database/queries/HistoryQueries";
import {
    createBackup,
    deleteNovelCache,
    restoreFromBackup,
} from "../../database/queries/NovelQueries";

import { Appbar } from "../../components/Appbar";
import {
    Divider,
    ListItem,
    ListSection,
    ListSubHeader,
} from "../../components/List";
import DisplayModeModal from "./components/DisplayModeModal";
import GridSizeModal from "./components/GridSizeModal";
import ThemeModal from "./components/ThemeModal";

const SettingsScreen = ({
    navigation,
    theme,
    themeCode,
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
                        onPress={restoreFromBackup}
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
    theme: state.themeReducer.theme,
    displayMode: state.settingsReducer.displayMode,
    itemsPerRow: state.settingsReducer.itemsPerRow,
});

export default connect(mapStateToProps, {
    switchTheme,
    setDisplayMode,
    setItemsPerRow,
})(SettingsScreen);
