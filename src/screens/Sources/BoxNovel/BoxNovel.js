import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import {
    TouchableRipple,
    Appbar,
    Provider,
    Portal,
    Button,
} from "react-native-paper";
import NovelCover from "../../../components/NovelCover";
import { theme } from "../../../theming/theme";
import { BottomSheet } from "../../../components/BottomSheet";
import HeaderSearchBar from "../../../components/HeaderSearchBar";

const AllNovels = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [novels, setNovels] = useState([]);

    const [sort, setSort] = useState("rating");
    const [pageNo, setPageNo] = useState(1);

    const [searchBar, setSearchBar] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [searched, setSearched] = useState(0);

    const getNovels = () => {
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/novels/${pageNo}/?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels((novels) => novels.concat(json));
                setLoading(false);
            })
            .finally(() => setPageNo(pageNo + 1));
    };

    const onEndReached = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 10;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const getSearchResults = (searchText) => {
        setLoading(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/search/?s=${searchText}&?o=rating`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    useEffect(() => {
        getNovels();
    }, [sort]);

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
                                    getNovels();
                                } else {
                                    setSearchBar(false);
                                    setSearchText("");
                                }
                            }}
                            color={theme.textColorPrimaryDark}
                        />
                        <HeaderSearchBar
                            searchText={searchText}
                            onChangeText={(text) => setSearchText(text)}
                            onSubmitEditing={() => {
                                setSort("rating");
                                getSearchResults(searchText);
                                setSearched(true);
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
            <View style={styles.container}>
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
                                onPress={() =>
                                    navigation.navigate("NovelItem", {
                                        ...item,
                                        navigatingFrom: 2,
                                    })
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
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
        padding: 3,
    },

    contentContainer: {
        flex: 1,
    },
});
