import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";

import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import EmptyView from "../../components/EmptyView";
import HistoryItem from "./HistoryItem";
import RemoveHistoryDialog from "./RemoveHistoryDialog";
import { ScreenContainer } from "../../components/Common";
import { Searchbar } from "../../components/Searchbar/Searchbar";

import { getHistoryAction } from "../../redux/history/history.actions";
import { dateFormat } from "../../services/utils/constants";
import { useTheme } from "../../hooks/reduxHooks";
import {
    deleteHistory,
    getHistoryFromDb,
} from "../../database/queries/HistoryQueries";

const History = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const getHistory = async () => {
        const history = await getHistoryFromDb();

        const groups = history.reduce((groups, update) => {
            var dateParts = update.historyTimeRead.split("-");
            var jsDate = new Date(
                dateParts[0],
                dateParts[1] - 1,
                dateParts[2].substr(0, 2)
            );
            const date = jsDate.toISOString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(update);
            return groups;
        }, {});

        const groupedHistory = Object.keys(groups).map((date) => {
            return {
                date,
                novels: groups[date],
            };
        });

        setHistory(groupedHistory);
        setLoading(false);
    };

    /**
     * Confirm Clear History Dialog
     */
    const [visible, setVisible] = useState(false);
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useFocusEffect(
        useCallback(() => {
            getHistory();
        }, [visible])
    );

    const deleteChapterHistory = (historyId) => {
        deleteHistory(historyId);
        getHistory();
    };

    const renderHistoryCard = ({ item }) => (
        <HistoryItem
            dispatch={dispatch}
            history={item}
            theme={theme}
            navigation={navigation}
            deleteHistory={deleteChapterHistory}
        />
    );

    const clearSearchbar = () => {
        setSearchText("");
        setSearchResults([]);
    };

    const onChangeText = (text) => {
        setSearchText(text);
        let results = [];

        text !== "" &&
            history.map((item) => {
                const date = item.date;
                const novels = item.novels.filter((novel) =>
                    novel.novelName.toLowerCase().includes(text.toLowerCase())
                );

                if (novels.length > 0) {
                    results.push({
                        date,
                        novels,
                    });
                }
            });

        setSearchResults(results);
    };

    return (
        <ScreenContainer theme={theme}>
            <Searchbar
                placeholder="Search History"
                searchText={searchText}
                clearSearchbar={clearSearchbar}
                onChangeText={onChangeText}
                backAction="magnify"
                theme={theme}
                actions={[
                    {
                        icon: "delete-sweep",
                        color: theme.textColorSecondary,
                        onPress: showDialog,
                    },
                ]}
            />
            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={searchText ? searchResults : history}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => (
                    <FlatList
                        keyExtractor={(item) => item.novelId.toString()}
                        data={item.novels}
                        renderItem={renderHistoryCard}
                        ListHeaderComponent={
                            <Text
                                style={{
                                    textTransform: "uppercase",
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    color: theme.textColorSecondary,
                                }}
                            >
                                {moment(item.date).calendar(null, dateFormat)}
                            </Text>
                        }
                    />
                )}
                ListFooterComponent={
                    loading && (
                        <ActivityIndicator
                            size="small"
                            color={theme.colorAccent}
                            style={{ margin: 16 }}
                        />
                    )
                }
                ListEmptyComponent={
                    !loading && (
                        <EmptyView
                            icon="(˘･_･˘)"
                            description="Nothing read recently"
                        />
                    )
                }
            />
            <RemoveHistoryDialog
                dialogVisible={visible}
                hideDialog={hideDialog}
                theme={theme}
            />
        </ScreenContainer>
    );
};

export default History;

const styles = StyleSheet.create({});
