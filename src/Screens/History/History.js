import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";

import HistoryCard from "./components/HistoryCard";

import { useDispatch, useSelector } from "react-redux";
import EmptyView from "../../Components/EmptyView";

import {
    getHistoryAction,
    clearAllHistoryAction,
} from "../../redux/history/history.actions";

import moment from "moment";
import { dateFormat } from "../../Services/utils/constants";
import { ScreenContainer } from "../../Components/Common";
import { Searchbar } from "../../Components/Searchbar";
import { useTheme } from "../../Hooks/reduxHooks";
import { Button, Dialog, Portal } from "react-native-paper";

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
        <HistoryCard
            dispatch={dispatch}
            item={item}
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
                left="magnify"
                theme={theme}
                right="trash-can-outline"
                onPressRight={showDialog}
            />
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                }}
                data={searchText ? searchResults : history}
                keyExtractor={(index) => index.toString()}
                renderItem={({ item }) => (
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={item.novels}
                        renderItem={renderHistoryCard}
                        ListHeaderComponent={
                            <Text
                                style={{
                                    textTransform: "uppercase",
                                    paddingVertical: 8,
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
            <Portal>
                <Dialog
                    visible={visible}
                    onDismiss={hideDialog}
                    style={{
                        borderRadius: 6,
                        backgroundColor: theme.colorPrimary,
                    }}
                >
                    <Dialog.Title
                        style={{
                            letterSpacing: 0,
                            fontSize: 16,
                            color: theme.textColorPrimary,
                        }}
                    >
                        Are you sure? All history will be lost.
                    </Dialog.Title>
                    <Dialog.Actions>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={hideDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            uppercase={false}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={() => {
                                dispatch(clearAllHistoryAction());
                                hideDialog();
                            }}
                        >
                            Ok
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScreenContainer>
    );
};

export default History;

const styles = StyleSheet.create({});
