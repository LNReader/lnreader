import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { theme } from "../theming/theme";
import { useFocusEffect } from "@react-navigation/native";

import { Button } from "react-native-paper";

import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("lnreader.db");

const UpdatesScreen = ({ navigation }) => {
    const [novels, setNovels] = useState();

    const getLibraryNovels = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable",
                null,
                (txObj, { rows: { _array } }) => {
                    setNovels(_array);
                    // console.log(_array);
                },
                (txObj, error) => console.log("Error ", error)
            );
            // tx.executeSql(
            //     "SELECT * FROM Chaptertable",
            //     null,
            //     (txObj, { rows: { _array } }) => {
            //         console.log(_array);
            //     },
            //     (txObj, error) => console.log("Error ", error)
            // );
        });
    };

    // const deleted = () => {
    //     db.transaction((tx) => {
    //         tx.executeSql(
    //             "DROP TABLE LibraryTable",
    //             null,
    //             (txObj) => {
    //                 console.log("Deleted");
    //             },
    //             (txObj, error) => console.log("Error ", error)
    //         );
    //     });
    // };

    useFocusEffect(
        useCallback(() => {
            getLibraryNovels();
        }, [])
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={novels}
                keyExtractor={(item) => item.novelId}
                renderItem={({ item }) => (
                    <Text
                        style={{ color: theme.colorAccentDark, fontSize: 20 }}
                        onPress={() =>
                            navigation.navigate("LibraryNovelItem", item)
                        }
                    >
                        {item.novelId}
                    </Text>
                )}
            />
            {/* <Button mode="contained" onPress={() => deleted()}>
                Delete
            </Button> */}
        </View>
    );
};

export default UpdatesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
        padding: 10,
    },
});
