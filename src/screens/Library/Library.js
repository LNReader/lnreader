import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { connect, useDispatch } from "react-redux";

import NovelCover from "../../Components/NovelCover";
import EmptyView from "../../Components/EmptyView";

import {
    getLibraryAction,
    searchLibraryAction,
} from "../../redux/library/library.actions";
import { SearchAppbar } from "../../Components/Appbar";
import { setNovel } from "../../redux/novel/novel.actions";
import { updateLibraryAction } from "../../redux/updates/updates.actions";
import { useTheme } from "../../Hooks/useTheme";
import { Searchbar } from "../../Components/Searchbar";

const LibraryScreen = ({ navigation, novels, loading, itemsPerRow }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setSearchText("");
            dispatch(getLibraryAction());
        }, [getLibraryAction])
    );

    const onRefresh = () => {
        setRefreshing(true);
        dispatch(updateLibraryAction());
        setRefreshing(false);
    };

    const redirectToNovel = (item) => {
        navigation.navigate("Novel", item);
        dispatch(setNovel(item));
    };

    const renderNovels = ({ item }) => (
        <NovelCover item={item} onPress={() => redirectToNovel(item)} />
    );

    const clearSearchbar = () => {
        dispatch(getLibraryAction());
        setSearchText("");
    };

    const onChangeText = (text) => {
        setSearchText(text);
        dispatch(searchLibraryAction(text));
    };

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <Searchbar
                    placeholder="Search Library"
                    searchText={searchText}
                    clearSearchbar={clearSearchbar}
                    onChangeText={onChangeText}
                    left="magnify"
                    theme={theme}
                />
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={theme.colorAccentDark}
                    />
                ) : (
                    <FlatList
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 8,
                        }}
                        numColumns={itemsPerRow}
                        key={itemsPerRow}
                        data={novels}
                        keyExtractor={(item) => item.novelUrl}
                        renderItem={renderNovels}
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
    itemsPerRow: state.settingsReducer.itemsPerRow,
    novels: state.libraryReducer.novels,
    loading: state.libraryReducer.loading,
});

export default connect(mapStateToProps)(LibraryScreen);

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
