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

import NovelCover from "../../components/common/NovelCover";
import EmptyView from "../../components/common/EmptyView";

import {
    getLibraryNovels,
    searchLibraryNovels,
} from "../../redux/actions/library";
import { SearchAppbar } from "../../components/common/Appbar";

const LibraryScreen = ({
    navigation,
    theme,
    novels,
    loading,
    getLibraryNovels,
    searchLibraryNovels,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const [searchText, setSearchText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setSearchText("");
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
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <SearchAppbar
                    screen="Library"
                    placeholder="Search Library"
                    getNovels={getLibraryNovels}
                    getSearchResults={searchLibraryNovels}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={theme.colorAccentDark}
                    />
                ) : (
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
                                progressBackgroundColor={theme.colorAccentDark}
                            />
                        }
                        ListEmptyComponent={
                            searchText !== "" ? (
                                <Text
                                    style={[
                                        styles.emptySearch,
                                        { color: theme.colorAccentDark },
                                    ]}
                                >
                                    {`"${searchText}" not in library`}
                                </Text>
                            ) : (
                                <EmptyView
                                    icon="Σ(ಠ_ಠ)"
                                    description="Your library is empty. Add series to your library from Browse."
                                />
                            )
                        }
                    />
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
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 16,
    },
});
