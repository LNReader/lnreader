import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { theme } from "../theming/theme";
import { useFocusEffect } from "@react-navigation/native";

import { TouchableRipple, Button } from "react-native-paper";
import NovelCover from "../components/NovelCover";

import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("lnreader.db");

const UpdatesScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [novels, setNovels] = useState();

    const getLibraryNovels = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM LibraryTable",
                null,
                (txObj, { rows: { _array } }) => {
                    setNovels(_array);
                    // console.log(_array);
                    setLoading(false);
                    setRefreshing(false);
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    const deleted = () => {
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
        });
        setNovels([]);
    };

    useFocusEffect(
        useCallback(() => {
            getLibraryNovels();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        getLibraryNovels();
    };

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{ flex: 1 }}
                numColumns={3}
                data={novels}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.novelUrl}
                renderItem={({ item }) => (
                    <TouchableRipple
                        borderless
                        centered
                        rippleColor="rgba(256,256,256,0.3)"
                        style={styles.opac}
                        onPress={() => navigation.navigate("NovelItem", item)}
                    >
                        <NovelCover item={item} />
                    </TouchableRipple>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["white"]}
                        progressBackgroundColor={theme.colorAccentDark}
                    />
                }
                ListEmptyComponent={
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: theme.textColorSecondaryDark,
                                fontSize: 45,
                                fontWeight: "bold",
                            }}
                        >
                            Σ(ಠ_ಠ)
                        </Text>
                        <Text
                            style={{
                                color: theme.textColorSecondaryDark,
                                fontWeight: "bold",
                                marginTop: 10,
                                textAlign: "center",
                                paddingHorizontal: 30,
                            }}
                        >
                            Your library is empty. Add series to your library
                            from Browse.
                        </Text>
                    </View>
                }
            />
            <Button mode="contained" onPress={() => deleted()}>
                Delete Library Table
            </Button>
        </View>
    );
};

export default UpdatesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
    opac: {
        height: 190,
        flex: 1 / 3,
        marginHorizontal: 3.6,
        marginVertical: 3.2,
    },
});
