import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import { Searchbar } from "../../components/Searchbar/Searchbar";
import NovelList from "../../components/NovelList";
import NovelCover from "../../components/NovelCover";
import EmptyView from "../../components/EmptyView";

import {
    getLibraryAction,
    searchLibraryAction,
} from "../../redux/library/library.actions";
import { updateLibraryAction } from "../../redux/updates/updates.actions";
import { useSettings, useTheme } from "../../hooks/reduxHooks";
import { setNovel } from "../../redux/novel/novel.actions";
import { Portal, TouchableRipple } from "react-native-paper";
import LibraryFilterSheet from "./components/LibraryFilterSheet";

const LibraryScreen = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const settings = useSettings();
    const {
        showNumberOfNovels,
        incognitoMode = false,
        updateLibraryOnLaunch = false,
    } = settings;

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

    useEffect(() => {
        updateLibraryOnLaunch && dispatch(updateLibraryAction());
    }, []);

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

    const renderItem = useCallback(
        ({ item }) => (
            <NovelCover
                item={item}
                onPress={() => {
                    navigation.navigate("Novel", item);
                    dispatch(setNovel(item));
                }}
                theme={theme}
            />
        ),
        []
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
                    backAction="magnify"
                    actions={[
                        {
                            icon: "filter-variant",
                            onPress: () => libraryFilterSheetRef.current.show(),
                            color: filter
                                ? theme.filterColor
                                : theme.textColorSecondary,
                        },
                    ]}
                    theme={theme}
                />
                {incognitoMode && (
                    <View
                        style={{
                            backgroundColor: "#424242",
                            paddingVertical: 4,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "#FFFFFF" }}>Incognito Mode</Text>
                    </View>
                )}
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
