import React, { useState } from "react";
import { View, ToastAndroid } from "react-native";

import { List, Divider, Checkbox } from "react-native-paper";
import { CustomAppbar } from "../../components/Appbar";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { switchTheme } from "../../theme/theme.action";

import { setAppTheme, getAppTheme } from "../../services/AsyncStorage";

import { setStatusBarStyle } from "expo-status-bar";

import {
    amoledDarkTheme,
    darkTheme,
    midnightDuskTheme,
    lightTheme,
} from "../../theme/theme";

// import { theme } from "../../theme/theme";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

import { connect } from "react-redux";

const SettingsScreen = ({ navigation, theme, switchTheme }) => {
    const desciptionStyles = {
        color: theme.textColorSecondaryDark,
    };

    const titleStyles = { color: theme.textColorPrimaryDark };
    const [displayMode, setDisplayMode] = useState("compact");

    const [applicationTheme, setApplicationTheme] = useState("amoledDarkTheme");

    getAppTheme().then((res) => setApplicationTheme(res));

    AsyncStorage.getItem("@display_mode").then((value) => {
        if (value) setDisplayMode(value);
    });

    const deleteHistory = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM HistoryTable");
        });
    };

    const deleteNovelsNotInLib = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "DELETE FROM LibraryTable WHERE libraryStatus=0",
                null,
                (txObj, res) => {
                    console.log("Deleted");
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const deleteDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "DROP TABLE LibraryTable",
                null,
                (txObj, { rows: { _array } }) => {
                    console.log("DELETED LIB TABLE");
                },
                (txObj, error) => console.log("Error ", error)
            );
            tx.executeSql(
                "DROP TABLE ChapterTable",
                null,
                (txObj, { rows: { _array } }) => {
                    console.log("DELETED CHAP TABLE");
                },
                (txObj, error) => console.log("Error ", error)
            );
            tx.executeSql(
                "DROP TABLE HistoryTable",
                null,
                (txObj, { rows: { _array } }) => {
                    console.log("DELETED History TABLE");
                },
                (txObj, error) => console.log("Error ", error)
            );
            tx.executeSql(
                "DROP TABLE DownloadsTable",
                null,
                (txObj, { rows: { _array } }) => {
                    console.log("DELETED Downloads TABLE");
                    ToastAndroid.show("Database deleted", ToastAndroid.SHORT);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

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
                        onPress={() => deleteNovelsNotInLib()}
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
                        <Checkbox.Item
                            label="Comfortable"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                displayMode === "comfortable"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                setDisplayMode("comfortable");
                                AsyncStorage.setItem(
                                    "@display_mode",
                                    "comfortable"
                                );
                            }}
                        />
                    </View>
                    <View>
                        <Checkbox.Item
                            label="Compact"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                displayMode === "compact"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                setDisplayMode("compact");
                                AsyncStorage.setItem(
                                    "@display_mode",
                                    "compact"
                                );
                            }}
                        />
                    </View>
                    <List.Subheader
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
                    />

                    <List.Subheader
                        style={{
                            color: theme.colorAccentDark,
                            paddingBottom: 5,
                        }}
                    >
                        Theme
                    </List.Subheader>
                    <View>
                        <Checkbox.Item
                            label="Amoled Dark"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                applicationTheme === "amoledDarkTheme"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                switchTheme(amoledDarkTheme);
                                setApplicationTheme("amoledDarkTheme");
                                setAppTheme("amoledDarkTheme");
                            }}
                        />
                    </View>
                    <View>
                        <Checkbox.Item
                            label="MidNight Dusk"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                applicationTheme === "midnightDuskTheme"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                switchTheme(midnightDuskTheme);
                                setApplicationTheme("midnightDuskTheme");
                                setAppTheme("midnightDuskTheme");
                            }}
                        />
                    </View>
                    <View>
                        <Checkbox.Item
                            label="Dark Theme"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                applicationTheme === "darkTheme"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                switchTheme(darkTheme);
                                setApplicationTheme("darkTheme");
                                setAppTheme("darkTheme");
                                setStatusBarStyle("light");
                            }}
                        />
                    </View>
                    <View>
                        <Checkbox.Item
                            label="Light Theme"
                            labelStyle={{ color: theme.textColorPrimaryDark }}
                            status={
                                applicationTheme === "lightTheme"
                                    ? "checked"
                                    : "unchecked"
                            }
                            mode="ios"
                            uncheckedColor={theme.textColorSecondaryDark}
                            color={theme.colorAccentDark}
                            onPress={() => {
                                switchTheme(lightTheme);
                                setApplicationTheme("lightTheme");
                                setAppTheme("lightTheme");
                                setStatusBarStyle("dark");
                            }}
                        />
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
