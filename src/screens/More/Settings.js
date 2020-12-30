import React from "react";
import { View } from "react-native";

import { List, Divider } from "react-native-paper";
import { CustomAppbar } from "../../components/Appbar";

import { theme } from "../../theming/theme";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const AboutScreen = ({ navigation }) => {
    const desciptionStyles = {
        color: theme.textColorSecondaryDark,
    };

    const titleStyles = { color: theme.textColorPrimaryDark };

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
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
        setNovels([]);
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
                </List.Section>
            </View>
        </>
    );
};

export default AboutScreen;
