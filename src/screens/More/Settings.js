import React, { useState } from "react";
import { View, ToastAndroid } from "react-native";
import { setStatusBarStyle } from "expo-status-bar";
import { List, Modal, Provider, Portal } from "react-native-paper";

import { connect } from "react-redux";
import { switchTheme } from "../../redux/actions/theme";
import { setDisplayMode } from "../../redux/actions/settings";

import { CustomAppbar } from "../../components/common/Appbar";
import {
    DisplayCheckbox,
    ThemeCheckbox,
} from "../../components/settings/Checkbox";

import {
    deleteHistory,
    deleteNovelsNotInLibrary,
    deleteDatabase,
} from "../../services/db";

const SettingsScreen = ({
    navigation,
    theme,
    themeCode,
    displayMode,
    switchTheme,
    setDisplayMode,
}) => {
    const label = {
        0: "Compact",
        1: "Comfortable",
    };

    const themes = {
        0: "Amoled Dark Theme",
        1: "Light Theme",
        2: "Dark Theme",
        3: "Midnight Dusk Theme",
    };

    const desciptionStyles = {
        color: theme.textColorSecondaryDark,
    };

    const titleStyles = { color: theme.textColorPrimaryDark };

    // Display Mode Modal
    const [displayModalVisible, setDisplayModalVisible] = useState(false);

    const showDisplayModal = () => setDisplayModalVisible(true);
    const hideDisplayModal = () => setDisplayModalVisible(false);

    // Theme Modal
    const [themeModalVisible, setthemeModalVisible] = useState(false);

    const showthemeModal = () => setthemeModalVisible(true);
    const hidethemeModal = () => setthemeModalVisible(false);

    return (
        <Provider>
            <CustomAppbar
                title="Settings"
                onBackAction={() => navigation.goBack()}
            />
            <View
                style={{ flex: 1, backgroundColor: theme.colorDarkPrimaryDark }}
            >
                <List.Section
                    style={{
                        flex: 1,
                        backgroundColor: theme.colorDarkPrimaryDark,
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
                        onPress={() => deleteNovelsNotInLibrary()}
                        rippleColor={theme.rippleColorDark}
                    />
                    <List.Item
                        titleStyle={titleStyles}
                        title="Clear history"
                        descriptionStyle={desciptionStyles}
                        description="Delete reading history for all novels"
                        onPress={() => deleteHistory()}
                        rippleColor={theme.rippleColorDark}
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
                        description={label[displayMode]}
                        onPress={showDisplayModal}
                        rippleColor={theme.rippleColorDark}
                    />
                    <Portal>
                        <Modal
                            visible={displayModalVisible}
                            onDismiss={hideDisplayModal}
                            contentContainerStyle={{
                                backgroundColor: theme.colorDarkPrimaryDark,
                                padding: 20,
                                margin: 20,
                            }}
                        >
                            <View>
                                <DisplayCheckbox
                                    value={1}
                                    displayMode={displayMode}
                                    onPress={() => setDisplayMode(1)}
                                />
                            </View>
                            <View>
                                <DisplayCheckbox
                                    value={0}
                                    displayMode={displayMode}
                                    onPress={() => setDisplayMode(0)}
                                />
                            </View>
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
                        rippleColor={theme.rippleColorDark}
                        onPress={() => deleteDatabase()}
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
                        description={themes[themeCode]}
                        onPress={showthemeModal}
                        rippleColor={theme.rippleColorDark}
                    />
                    <Portal>
                        <Modal
                            visible={themeModalVisible}
                            onDismiss={hidethemeModal}
                            contentContainerStyle={{
                                backgroundColor: theme.colorDarkPrimaryDark,
                                padding: 20,
                                margin: 20,
                            }}
                        >
                            <ThemeCheckbox
                                label={themes[1]}
                                checked={themeCode === 1 ? true : false}
                                onPress={() => {
                                    switchTheme(1);
                                    setStatusBarStyle("dark");
                                }}
                            />
                            <ThemeCheckbox
                                label={themes[2]}
                                checked={themeCode === 2 ? true : false}
                                onPress={() => {
                                    switchTheme(2);
                                    setStatusBarStyle("light");
                                }}
                            />
                            <ThemeCheckbox
                                label={themes[0]}
                                checked={themeCode === 0 ? true : false}
                                onPress={() => {
                                    switchTheme(0);
                                    setStatusBarStyle("light");
                                }}
                            />
                            <ThemeCheckbox
                                label={themes[3]}
                                checked={themeCode === 3 ? true : false}
                                onPress={() => {
                                    switchTheme(3);
                                    setStatusBarStyle("light");
                                }}
                            />
                        </Modal>
                    </Portal>
                </List.Section>
            </View>
        </Provider>
    );
};

const mapStateToProps = (state) => ({
    themeCode: state.themeReducer.themeCode,
    theme: state.themeReducer.theme,
    displayMode: state.settingsReducer.displayMode,
});

export default connect(mapStateToProps, { switchTheme, setDisplayMode })(
    SettingsScreen
);
