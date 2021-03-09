import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Appbar, Provider, Portal } from "react-native-paper";

import NovelCover from "../../../components/common/NovelCover";
import HeaderSearchBar from "../../../components/HeaderSearchBar";
import { BottomSheet } from "./filters/BottomSheet";

import { useSelector } from "react-redux";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const AllNovels = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [novels, setNovels] = useState([]);
    const [libraryNovels, setlibraryNovels] = useState([]);

    const [sort, setSort] = useState("rating");
    const [pageNo, setPageNo] = useState(1);

    const [searchBar, setSearchBar] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [searched, setSearched] = useState(0);

    const theme = useSelector((state) => state.themeReducer.theme);

    const getNovels = () => {
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/novels/${pageNo}/?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => {
                setPageNo(pageNo + 1);
                setNovels((novels) => novels.concat(json));
                setLoading(false);
            });
    };

    const getLibraryNovels = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT novelUrl FROM LibraryTable WHERE libraryStatus = 1 AND extensionId = 1",
                null,
                (tx, { rows: { _array } }) => {
                    setlibraryNovels(_array);
                },
                (tx, error) => console.log(error)
            );
        });
    };

    const onEndReached = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 5;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const getSearchResults = (searchText) => {
        setLoading(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/search/?s=${searchText}&?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const checkIFInLibrary = (id) => {
        return libraryNovels.some((obj) => obj.novelUrl === id);
    };

    useEffect(() => {
        getLibraryNovels();
        getNovels();
    }, [sort]);

    const sortNovels = () => {
        setLoading(true);
        if (searched) {
            getSearchResults();
        } else {
            getNovels();
        }
    };

    return (
        <Provider>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                {!searchBar ? (
                    <>
                        <Appbar.BackAction
                            onPress={() => navigation.goBack()}
                            color={theme.textColorPrimaryDark}
                        />

                        <Appbar.Content
                            title="Box Novel"
                            titleStyle={{ color: theme.textColorPrimaryDark }}
                        />
                        <Appbar.Action
                            icon="magnify"
                            onPress={() => setSearchBar(true)}
                            color={theme.textColorPrimaryDark}
                        />
                        <Appbar.Action
                            icon="filter-variant"
                            onPress={() => _panel.show({ velocity: -1.5 })}
                            color={theme.textColorPrimaryDark}
                        />
                    </>
                ) : (
                    <>
                        <Appbar.BackAction
                            onPress={() => {
                                if (searched) {
                                    setLoading(true);
                                    setPageNo(1);
                                    setNovels([]);
                                    getNovels();
                                }
                                setSearchBar(false);
                                setSearchText("");
                            }}
                            color={theme.textColorPrimaryDark}
                        />
                        <HeaderSearchBar
                            searchText={searchText}
                            onChangeText={(text) => setSearchText(text)}
                            onSubmitEditing={() => {
                                if (searchText !== "") {
                                    setSort("rating");
                                    getSearchResults(searchText);
                                    setSearched(true);
                                }
                            }}
                        />
                        {searchText !== "" && (
                            <Appbar.Action
                                icon="close"
                                onPress={() => {
                                    setSearchText("");
                                }}
                                color={theme.textColorPrimaryDark}
                            />
                        )}
                    </>
                )}
            </Appbar.Header>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size={60}
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <FlatList
                        contentContainerStyle={styles.list}
                        numColumns={3}
                        data={novels}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.novelUrl}
                        ListFooterComponent={() =>
                            loadingMore && (
                                <ActivityIndicator
                                    color={theme.colorAccentDark}
                                    size="small"
                                    style={{ marginTop: 20, marginBottom: 80 }}
                                />
                            )
                        }
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() => {
                                    navigation.navigate("NovelItem", {
                                        ...item,
                                        navigatingFrom: 2,
                                    });
                                }}
                                libraryStatus={
                                    checkIFInLibrary(item.novelUrl)
                                        ? true
                                        : false
                                }
                            />
                        )}
                        onScroll={({ nativeEvent }) => {
                            if (onEndReached(nativeEvent)) {
                                setLoadingMore(true);
                                getNovels();
                                console.log("End Reached");
                            }
                        }}
                    />
                )}
            </View>
            <Portal>
                <BottomSheet
                    bottomSheetRef={(c) => (_panel = c)}
                    setSort={setSort}
                    sort={sort}
                />
            </Portal>
        </Provider>
    );
};

export default AllNovels;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 3,
    },

    contentContainer: {
        flex: 1,
    },
});
