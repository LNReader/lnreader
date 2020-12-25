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

import { TouchableRipple } from "react-native-paper";
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
                },
                (txObj, error) => console.log("Error ", error)
            );
        });
    };

    useFocusEffect(
        useCallback(() => {
            getLibraryNovels();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        getNovels();
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator
                        size="large"
                        color={theme.colorAccentDark}
                    />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    numColumns={3}
                    data={novels}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.novelId}
                    renderItem={({ item }) => (
                        <TouchableRipple
                            borderless
                            centered
                            rippleColor="rgba(256,256,256,0.3)"
                            style={styles.opac}
                            onPress={() =>
                                navigation.navigate("LibraryNovelItem", item)
                            }
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
                />
            )}
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
    opac: {
        height: 190,
        flex: 1 / 3,
        margin: 3.2,
    },
});
