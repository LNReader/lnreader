import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    RefreshControl,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { connect } from "react-redux";

import Appbar from "./components/Appbar";
import NovelCover from "../../components/common/NovelCover";
import EmptyView from "./components/EmptyView";

import {
    getLibraryNovels,
    searchLibraryNovels,
} from "../../redux/actions/library";

const LibraryScreen = ({
    navigation,
    theme,
    novels,
    loading,
    getLibraryNovels,
    searchLibraryNovels,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState({ searching: false, searchText: "" });

    const resetSearch = () => setSearch({ searching: false, searchText: "" });

    useFocusEffect(
        useCallback(() => {
            resetSearch();
            getLibraryNovels();
        }, [])
    );

    /**
     * TODO: fix refreshing
     */
    const onRefresh = () => {
        ToastAndroid.show("Updating library", ToastAndroid.SHORT);
        setRefreshing(true);
        getLibraryNovels();
        setRefreshing(false);
    };

    const redirectToNovel = (item) =>
        navigation.navigate("NovelItem", {
            ...item,
            navigatingFrom: 1,
        });

    return (
        <>
            <Appbar
                search={search}
                setSearch={setSearch}
                getLibraryNovels={getLibraryNovels}
                searchLibraryNovels={searchLibraryNovels}
            />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={theme.colorAccentDark}
                    />
                ) : (
                    <>
                        <FlatList
                            numColumns={3}
                            data={novels}
                            keyExtractor={(item) => item.novelUrl}
                            renderItem={({ item }) => (
                                <NovelCover
                                    item={item}
                                    onPress={() => redirectToNovel(item)}
                                />
                            )}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={["white"]}
                                    progressBackgroundColor={
                                        theme.colorAccentDark
                                    }
                                />
                            }
                            ListEmptyComponent={
                                search.searchText === "" ? (
                                    <EmptyView />
                                ) : (
                                    <Text
                                        style={[
                                            styles.emptySearch,
                                            { color: theme.colorAccentDark },
                                        ]}
                                    >
                                        {`"${search.searchText}" not in library`}
                                    </Text>
                                )
                            }
                        />
                    </>
                )}
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    novels: state.libraryReducer.novels,
    loading: state.libraryReducer.loading,
});

export default connect(mapStateToProps, {
    getLibraryNovels,
    searchLibraryNovels,
})(LibraryScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
    emptySearch: {
        fontWeight: "bold",
        marginTop: 10,
        textAlign: "center",
        paddingHorizontal: 30,
    },
});
