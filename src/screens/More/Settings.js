import React, { useState } from "react";
import { View, ToastAndroid } from "react-native";
import { setStatusBarStyle } from "expo-status-bar";
import { List } from "react-native-paper";

import { connect } from "react-redux";
import { switchTheme } from "../../redux/actions/theme";
import {
    amoledDarkTheme,
    darkTheme,
    midnightDuskTheme,
    lightTheme,
} from "../../theme/theme";

import { CustomAppbar } from "../../components/common/Appbar";
import {
    DisplayCheckbox,
    ThemeCheckbox,
} from "../../components/settings/Checkbox";

import {
    setAppTheme,
    getAppTheme,
    getDisplayMode,
    setDisplayMode,
} from "../../services/asyncStorage";

import {
    deleteHistory,
    deleteNovelsNotInLibrary,
    deleteDatabase,
} from "../../services/db";

const SettingsScreen = ({ navigation, theme, switchTheme }) => {
    const desciptionStyles = {
        color: theme.textColorSecondaryDark,
    };

    const titleStyles = { color: theme.textColorPrimaryDark };

    const [displayMode, setDisplay] = useState("compact");
    const [applicationTheme, setApplicationTheme] = useState("amoledDarkTheme");

    getAppTheme().then((res) => setApplicationTheme(res));

    getDisplayMode().then((res) => setDisplay(res));

    return (
        <>
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
                    <View>
                        <DisplayCheckbox
                            value="comfortable"
                            displayMode={displayMode}
                            onPress={() => {
                                setDisplay("comfortable");
                                setDisplayMode("comfortable");
                            }}
                        />
                    </View>
                    <View>
                        <DisplayCheckbox
                            value="compact"
                            displayMode={displayMode}
                            onPress={() => {
                                setDisplay("compact");
                                setDisplayMode("compact");
                            }}
                        />
                    </View>
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
                    <View>
                        <ThemeCheckbox
                            label="Light Theme"
                            checked={
                                applicationTheme === "lightTheme" ? true : false
                            }
                            onPress={() => {
                                switchTheme(lightTheme);
                                setApplicationTheme(`lightTheme`);
                                setAppTheme("lightTheme");
                                setStatusBarStyle("dark");
                            }}
                        />
                    </View>
                    <View>
                        <ThemeCheckbox
                            label="Dark Theme"
                            checked={
                                applicationTheme === "darkTheme" ? true : false
                            }
                            onPress={() => {
                                switchTheme(darkTheme);
                                setApplicationTheme("darkTheme");
                                setAppTheme("darkTheme");
                                setStatusBarStyle("light");
                            }}
                        />
                        <View>
                            <ThemeCheckbox
                                label="Amoled Dark Theme"
                                checked={
                                    applicationTheme === "amoledDarkTheme"
                                        ? true
                                        : false
                                }
                                onPress={() => {
                                    switchTheme(amoledDarkTheme);
                                    setApplicationTheme(`amoledDarkTheme`);
                                    setAppTheme("amoledDarkTheme");
                                    setStatusBarStyle("light");
                                }}
                            />
                        </View>
                        <View>
                            <ThemeCheckbox
                                label="Midnight Dusk Theme"
                                checked={
                                    applicationTheme === "midnightDuskTheme"
                                        ? true
                                        : false
                                }
                                onPress={() => {
                                    switchTheme(midnightDuskTheme);
                                    setApplicationTheme("midnightDuskTheme");
                                    setAppTheme("midnightDuskTheme");
                                    setStatusBarStyle("light");
                                }}
                            />
                        </View>
                    </View>
                </List.Section>
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
});

export default connect(mapStateToProps, { switchTheme })(SettingsScreen);
