import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";

import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import EmptyView from "../../components/EmptyView";
import HistoryItem from "./HistoryItem";
import RemoveHistoryDialog from "./RemoveHistoryDialog";
import { ScreenContainer } from "../../components/Common";
import { Searchbar } from "../../components/Searchbar/Searchbar";

import { getHistoryAction } from "../../redux/history/history.actions";
import { dateFormat } from "../../services/utils/constants";
import { useTheme } from "../../hooks/reduxHooks";

const History = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { history, loading } = useSelector((state) => state.historyReducer);

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    /**
     * Confirm Clear History Dialog
     */
    const [visible, setVisible] = useState(false);
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useEffect(() => {
        dispatch(getHistoryAction());
    }, [getHistoryAction]);

    const renderHistoryCard = ({ item }) => (
        <HistoryItem
            dispatch={dispatch}
            history={item}
            theme={theme}
            navigation={navigation}
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
                keyExtractor={(item, index) => item.date}
                renderItem={({ item }) => (
                    <FlatList
                        keyExtractor={(item, index) => item.novelId.toString()}
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
                        />
                    )
                }
                ListEmptyComponent={
                    <EmptyView
                        icon="(˘･_･˘)"
                        description="Nothing read recently"
                    />
                }
            />
            <RemoveHistoryDialog
                dialogVisible={visible}
                hideDialog={hideDialog}
                dispatch={dispatch}
                theme={theme}
            />
        </ScreenContainer>
    );
};

export default History;

const styles = StyleSheet.create({});
