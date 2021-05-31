import React, { useState, useCallback, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import { Searchbar } from "../../Components/Searchbar";
import NovelList from "../../Components/NovelList";
import NovelCover from "../../Components/NovelCover";
import EmptyView from "../../Components/EmptyView";

import {
    getLibraryAction,
    searchLibraryAction,
} from "../../redux/library/library.actions";
import { updateLibraryAction } from "../../redux/updates/updates.actions";
import { useSettings, useTheme } from "../../Hooks/reduxHooks";
import { setNovel } from "../../redux/novel/novel.actions";
import { Portal, TouchableRipple } from "react-native-paper";
import LibraryFilterSheet from "./components/LibraryFilterSheet";

const LibraryScreen = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { showNumberOfNovels } = useSettings();

    const libraryFilterSheetRef = useRef(null);

    const {
        loading,
        novels,
        filters: { sort, filter },
    } = useSelector((state) => state.libraryReducer);

    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setSearchText("");
            dispatch(getLibraryAction(sort, filter));
        }, [getLibraryAction, sort, filter])
    );

    const onRefresh = () => {
        setRefreshing(true);
        dispatch(updateLibraryAction());
        setRefreshing(false);
    };

    const clearSearchbar = () => {
        dispatch(getLibraryAction(sort, filter));
        setSearchText("");
    };

    const onChangeText = (text) => {
        setSearchText(text);
        dispatch(searchLibraryAction(text, sort, filter));
    };

    const renderItem = ({ item }) => (
        <NovelCover
            item={item}
            onPress={() => {
                navigation.navigate("Novel", item);
                dispatch(setNovel(item));
            }}
        />
    );

    const refreshControl = () => (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["white"]}
            progressBackgroundColor={theme.colorAccent}
        />
    );

    // if (!loading) {
    //     console.log(novels);
    // }

    const listEmptyComponent = () =>
        searchText === "" && (
            <EmptyView
                icon="Σ(ಠ_ಠ)"
                description="Your library is empty. Add series to your library from Browse."
            />
        );

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <Searchbar
                    placeholder={`Search Library ${
                        showNumberOfNovels ? "(" + novels.length + ")" : ""
                    }`}
                    searchText={searchText}
                    clearSearchbar={clearSearchbar}
                    onChangeText={onChangeText}
                    left="magnify"
                    right="filter-variant"
                    filter={filter}
                    onPressRight={() => libraryFilterSheetRef.current.show()}
                    theme={theme}
                />
                {loading ? (
                    <ActivityIndicator size="small" color={theme.colorAccent} />
                ) : (
                    <>
                        {searchText !== "" && (
                            <TouchableRipple
                                onPress={() =>
                                    navigation.navigate("GlobalSearch", {
                                        novelName: searchText,
                                    })
                                }
                                borderless
                                rippleColor={theme.colorAccent}
                                style={styles.emptySearch}
                            >
                                <Text style={{ color: theme.colorAccent }}>
                                    {`Search for "${searchText}" globally`}
                                </Text>
                            </TouchableRipple>
                        )}
                        <NovelList
                            data={novels}
                            renderItem={renderItem}
                            refreshControl={refreshControl()}
                            ListEmptyComponent={listEmptyComponent}
                        />
                        <Portal>
                            <LibraryFilterSheet
                                bottomSheetRef={libraryFilterSheetRef}
                                theme={theme}
                                dispatch={dispatch}
                                sort={sort}
                                filter={filter}
                            />
                        </Portal>
                    </>
                )}
            </View>
        </>
    );
};

export default LibraryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptySearch: {
        alignItems: "center",
        paddingVertical: 8,
        borderRadius: 4,
    },
});
