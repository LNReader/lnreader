import React, { useState } from "react";
import { View, Text } from "react-native";
import { setStatusBarStyle } from "expo-status-bar";
import { List, Modal, Portal } from "react-native-paper";
import InputSpinner from "react-native-input-spinner";

import { connect } from "react-redux";
import { switchTheme } from "../../redux/theme/theme.actions";
import {
    setDisplayMode,
    setItemsPerRow,
} from "../../redux/settings/settings.actions";

import { Appbar } from "../../components/common/Appbar";
import {
    DisplayCheckbox,
    ThemeCheckbox,
} from "../../components/settings/Checkbox";

import { deleteAllHistory } from "../../database/queries/HistoryQueries";
import { deleteNovelCache } from "../../database/queries/NovelQueries";
// import { deleteDb } from "../../database/DBHelper";

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
    const display = {
        0: "Compact Grid",
        1: "Comfortable Grid",
        2: "List",
    };

    const themes = [
        { themeCode: 0, label: "AMOLED Dark Theme", statusBar: "light" },
        { themeCode: 1, label: "Light Theme", statusBar: "dark" },
        { themeCode: 2, label: "Dark Theme", statusBar: "light" },
        { themeCode: 3, label: "Midnight Dusk Theme", statusBar: "light" },
    ];

    const desciptionStyles = {
        color: theme.textColorSecondary,
    };

    const titleStyles = { color: theme.textColorPrimary };

    /**
     * Display Mode Modal
     */
    const [displayModalVisible, setDisplayModalVisible] = useState(false);
    const showDisplayModal = () => setDisplayModalVisible(true);
    const hideDisplayModal = () => setDisplayModalVisible(false);

    /**
     * Change Theme Modal
     */
    const [themeModalVisible, setthemeModalVisible] = useState(false);
    const showthemeModal = () => setthemeModalVisible(true);
    const hidethemeModal = () => setthemeModalVisible(false);

    const [itemsModalVisible, setitemsModalVisible] = useState(false);
    const showitemsModal = () => setitemsModalVisible(true);
    const hideitemsModal = () => setitemsModalVisible(false);

    return (
        <>
            <Appbar title="Settings" onBackAction={() => navigation.goBack()} />
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
                <List.Section
                    style={{
                        flex: 1,
                        backgroundColor: theme.colorPrimaryDark,
                    }}
                >
                    <List.Subheader
                        style={{
                            color: theme.colorAccentDark,
                            paddingBottom: 5,
                        }}
                    >
                        Data
                    </List.Subheader>
                    <List.Item
                        titleStyle={titleStyles}
                        title="Clear database"
                        descriptionStyle={desciptionStyles}
                        description="Delete history for novels not in your library"
                        onPress={() => deleteNovelCache()}
                        rippleColor={theme.rippleColor}
                    />
                    <List.Item
                        titleStyle={titleStyles}
                        title="Clear history"
                        descriptionStyle={desciptionStyles}
                        description="Delete reading history for all novels"
                        onPress={() => deleteAllHistory()}
                        rippleColor={theme.rippleColor}
                    />
                    <List.Subheader
                        style={{
                            color: theme.colorAccentDark,
                            paddingBottom: 5,
                        }}
                    >
                        Display
                    </List.Subheader>
                    <List.Item
                        titleStyle={titleStyles}
                        title="Display Mode"
                        descriptionStyle={desciptionStyles}
                        description={display[displayMode]}
                        onPress={showDisplayModal}
                        rippleColor={theme.rippleColor}
                    />
                    <Portal>
                        <Modal
                            visible={displayModalVisible}
                            onDismiss={hideDisplayModal}
                            contentContainerStyle={{
                                backgroundColor: theme.colorPrimaryDark,
                                padding: 20,
                                margin: 20,
                                borderRadius: 6,
                            }}
                        >
                            <DisplayCheckbox
                                value={1}
                                displayMode={displayMode}
                                onPress={() => setDisplayMode(1)}
                            />
                            <DisplayCheckbox
                                value={0}
                                displayMode={displayMode}
                                onPress={() => setDisplayMode(0)}
                            />
                            <DisplayCheckbox
                                value={2}
                                displayMode={displayMode}
                                onPress={() => setDisplayMode(2)}
                            />
                        </Modal>
                    </Portal>
                    <List.Item
                        titleStyle={titleStyles}
                        title="Items per row in library"
                        descriptionStyle={desciptionStyles}
                        description={itemsPerRow}
                        onPress={showitemsModal}
                        rippleColor={theme.rippleColor}
                    />
                    <Portal>
                        <Modal
                            visible={itemsModalVisible}
                            onDismiss={hideitemsModal}
                            contentContainerStyle={{
                                backgroundColor: theme.colorPrimaryDark,
                                padding: 20,
                                margin: 20,
                                borderRadius: 6,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.textColorPrimary,
                                    fontSize: 18,
                                    marginBottom: 10,
                                }}
                            >
                                Items per row
                            </Text>
                            <InputSpinner
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 16,
                                    elevation: 0,
                                }}
                                max={10}
                                min={1}
                                skin="paper"
                                background={theme.colorPrimaryDark}
                                colorMax={theme.colorAccentDark}
                                colorLeft={theme.colorAccentDark}
                                colorRight={theme.colorAccentDark}
                                buttonTextColor={theme.textColorPrimary}
                                colorPress={"white"}
                                colorMin={theme.colorAccentDark}
                                value={itemsPerRow}
                                onChange={(num) => setItemsPerRow(num)}
                                inputStyle={{
                                    color: theme.textColorPrimary,
                                }}
                            />
                        </Modal>
                    </Portal>

                    {/* <List.Subheader
                        style={{
                            color: theme.colorAccentDark,
                            paddingBottom: 5,
                        }}
                    >
                        Devloper options
                    </List.Subheader>
                    <List.Item
                        titleStyle={titleStyles}
                        title="Delete database"
                        descriptionStyle={desciptionStyles}
                        description="Delete entire database"
                        rippleColor={theme.rippleColor}
                        onPress={() => deleteDb()}
                    /> */}
                    <List.Subheader
                        style={{
                            color: theme.colorAccentDark,
                            paddingBottom: 5,
                        }}
                    >
                        Theme
                    </List.Subheader>
                    <List.Item
                        titleStyle={titleStyles}
                        title="Theme"
                        descriptionStyle={desciptionStyles}
                        description={themes[themeCode].label}
                        onPress={showthemeModal}
                        rippleColor={theme.rippleColor}
                    />
                    <Portal>
                        <Modal
                            visible={themeModalVisible}
                            onDismiss={hidethemeModal}
                            contentContainerStyle={{
                                backgroundColor: theme.colorPrimaryDark,
                                padding: 20,
                                margin: 20,
                                borderRadius: 6,
                            }}
                        >
                            {themes.map((item, index) => (
                                <ThemeCheckbox
                                    key={index}
                                    label={themes[item.themeCode].label}
                                    checked={
                                        themeCode === item.themeCode
                                            ? true
                                            : false
                                    }
                                    onPress={() => {
                                        switchTheme(item.themeCode);
                                        setStatusBarStyle(item.statusBar);
                                    }}
                                />
                            ))}
                        </Modal>
                    </Portal>
                </List.Section>
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    themeCode: state.themeReducer.themeCode,
    theme: state.themeReducer.theme,
    displayMode: state.settingsReducer.displayMode,
    itemsPerRow: state.settingsReducer.itemsPerRow,
});

export default connect(mapStateToProps, {
    switchTheme,
    setDisplayMode,
    setItemsPerRow,
})(SettingsScreen);
