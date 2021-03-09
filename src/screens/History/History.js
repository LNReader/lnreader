import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";

import { CustomAppbar } from "../../components/common/Appbar";
import HistoryCard from "../../components/history/HistoryCard";

import { getHistoryFromDb, deleteChapterHistory } from "../../services/db";

import { useSelector } from "react-redux";

const History = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState();

    const theme = useSelector((state) => state.themeReducer.theme);

    const getHistory = async () => {
        await getHistoryFromDb().then((res) => setHistory(res));
        setLoading(false);
    };

    const deleteHistory = (novelId) => {
        deleteChapterHistory(novelId);
        getHistory();
    };

    useFocusEffect(
        useCallback(() => {
            getHistory();
        }, [])
    );

    return (
        <>
            <CustomAppbar title="History" />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                <FlatList
                    contentContainerStyle={{ flex: 1 }}
                    data={history}
                    keyExtractor={(item) => item.historyId.toString()}
                    renderItem={({ item }) => (
                        <HistoryCard
                            item={item}
                            deleteHistory={deleteHistory}
                            navigation={navigation}
                        />
                    )}
                    ListFooterComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    ListEmptyComponent={
                        !loading && (
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
                                    (˘･_･˘)
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
                                    Nothing read recently.
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </>
    );
};

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    historyCard: {
        marginTop: 10,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
});
