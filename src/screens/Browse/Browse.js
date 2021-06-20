import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useTheme } from "../../hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import {
    getSourcesAction,
    searchSourcesAction,
} from "../../redux/source/source.actions";

import SourceCard from "./components/SourceCard";
import { showToast } from "../../hooks/showToast";
import { Searchbar } from "../../components/Searchbar";
import MalCard from "./components/MalCard";
import NovelUpdatesCard from "./components/NovelUpdatesCard";
import EmptyView from "../../components/EmptyView";

const Browse = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    // const [globalSearch, setGlobalSearch] = useState(false);
    // const [searchResult, setSearchResults] = useState();
    let {
        sources,
        search,
        loading,
        pinned,
        filters = [],
        showNovelUpdates = true,
        showMyAnimeList = true,
    } = useSelector((state) => state.sourceReducer);
    const theme = useTheme();
    const dispatch = useDispatch();

    const isPinned = (sourceId) =>
        pinned.indexOf(sourceId) === -1 ? false : true;

    sources = sources.filter((source) => filters.indexOf(source.lang) === -1);

    useEffect(() => {
        dispatch(getSourcesAction());
    }, [getSourcesAction]);

    const onRefresh = () => {
        showToast("Updating extension list");
        setRefreshing(true);
        getSourcesAction();
        setRefreshing(false);
    };

    const clearSearchbar = () => {
        setSearchText("");
    };

    const onChangeText = (text) => {
        setSearchText(text);
        dispatch(searchSourcesAction(text));
    };

    // const onSubmitEditing = () => {};

    const renderItem = ({ item }) => (
        <SourceCard
            item={item}
            isPinned={isPinned(item.sourceId)}
            theme={theme}
        />
    );

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <Searchbar
                theme={theme}
                placeholder="Search Source"
                backAction="magnify"
                searchText={searchText}
                onChangeText={onChangeText}
                clearSearchbar={clearSearchbar}
                actions={[
                    {
                        icon: "book-search",
                        onPress: () => navigation.navigate("GlobalSearch"),
                    },
                    {
                        icon: "swap-vertical-variant",
                        onPress: () => navigation.navigate("Migration"),
                    },
                    {
                        icon: "cog-outline",
                        onPress: () => navigation.navigate("BrowseSettings"),
                    },
                ]}
            />

            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={!searchText ? sources : search}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
                extraData={pinned}
                ListHeaderComponent={
                    <View>
                        {(showNovelUpdates || showMyAnimeList) && (
                            <>
                                <Text
                                    style={{
                                        color: theme.textColorSecondary,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                    }}
                                >
                                    Discover
                                </Text>
                                {showNovelUpdates && (
                                    <NovelUpdatesCard theme={theme} />
                                )}
                                {showMyAnimeList && <MalCard theme={theme} />}
                            </>
                        )}
                        {pinned.length > 0 && (
                            <FlatList
                                contentContainerStyle={{ paddingBottom: 16 }}
                                data={sources.filter((source) =>
                                    isPinned(source.sourceId)
                                )}
                                keyExtractor={(item) =>
                                    item.sourceId.toString()
                                }
                                renderItem={renderItem}
                                extraData={pinned}
                                ListHeaderComponent={
                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                        }}
                                    >
                                        Pinned
                                    </Text>
                                }
                            />
                        )}
                        {sources.length > 0 && (
                            <Text
                                style={{
                                    color: theme.textColorSecondary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                }}
                            >
                                Sources
                            </Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator
                            size="small"
                            color={theme.colorAccent}
                            style={{ marginTop: 16 }}
                        />
                    ) : (
                        sources.length === 0 && (
                            <EmptyView
                                icon="(･Д･。"
                                description="Enable languages from settings"
                            />
                        )
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["white"]}
                        progressBackgroundColor={theme.colorAccent}
                    />
                }
            />
        </View>
    );
};

export default Browse;

const styles = StyleSheet.create({
    container: { flex: 1 },
});
