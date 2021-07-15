import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { useDispatch } from "react-redux";

import { useTheme, useLibrary, useSettings } from "../../hooks/reduxHooks";
import { setAppSettings } from "../../redux/settings/settings.actions";
import { getSource } from "../../sources/sources";
import { showToast } from "../../hooks/showToast";

import { Searchbar } from "../../components/Searchbar/Searchbar";
import { LoadingScreen } from "../../components/LoadingScreen/LoadingScreen";
import NovelCover from "../../components/NovelCover";
import NovelList from "../../components/NovelList";
import ErrorView from "../../components/ErrorView";

const Extension = ({ navigation, route }) => {
    const { sourceId, sourceName, url } = route.params;

    const theme = useTheme();
    const library = useLibrary();
    const dispatch = useDispatch();
    const { displayMode } = useSettings();

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState([]);
    const [page, setPage] = useState(1);
    const [error, setError] = useState();
    const [totalPages, setTotalPages] = useState(1);

    const [searchText, setSearchText] = useState("");

    const incrementPage = () => setPage((page) => page + 1);

    const clearSearchbar = () => {
        setNovels([]);
        setPage(1);
        setLoading(true);
        setSearchText("");
    };

    const getNovels = async () => {
        try {
            if (page <= totalPages) {
                const source = getSource(sourceId);
                const res = await source.popularNovels(page);
                setNovels((novels) => [...novels, ...res.novels]);
                setTotalPages(res.totalPages);
                setLoading(false);
            }
        } catch (error) {
            setError(error.message);
            showToast(error.message);
            setNovels([]);
            setLoading(false);
        }
    };

    const getSearchResults = async () => {
        try {
            setLoading(true);
            const source = getSource(sourceId);
            const res = await source.searchNovels(searchText);
            setNovels(res);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            showToast(error.message);
            setNovels([]);
            setLoading(false);
        }
    };

    const checkIFInLibrary = (sourceId, novelUrl) => {
        return library.some(
            (obj) => obj.novelUrl === novelUrl && obj.sourceId === sourceId
        );
    };

    useEffect(() => {
        let mounted = true;
        getNovels();

        return () => {
            mounted = false;
        };
    }, [page]);

    const isCloseToBottom = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 20;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const onScroll = ({ nativeEvent }) => {
        if (!searchText && isCloseToBottom(nativeEvent)) {
            incrementPage();
        }
    };

    const renderItem = ({ item }) => (
        <NovelCover
            item={item}
            onPress={() =>
                navigation.navigate("Novel", {
                    novelName: item.novelName,
                    novelCover: item.novelCover,
                    novelUrl: item.novelUrl,
                    sourceId,
                })
            }
            libraryStatus={checkIFInLibrary(item.sourceId, item.novelUrl)}
        />
    );

    const listEmptyComponent = () => (
        <ErrorView
            error={error || "No results found"}
            onRetry={() => {
                getNovels();
                setLoading(true);
                setError();
            }}
            openWebView={() => WebBrowser.openBrowserAsync(url)}
            theme={theme}
        />
    );

    const displayMenuIcon = () => {
        const icons = {
            0: "view-module",
            1: "view-list",
            2: "view-module",
        };

        return icons[displayMode];
    };

    const getNextDisplayMode = () =>
        displayMode === 0 ? 1 : displayMode === 1 ? 2 : displayMode === 2 && 0;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <Searchbar
                theme={theme}
                placeholder={`Search ${sourceName}`}
                backAction="arrow-left"
                onBackAction={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchResults}
                clearSearchbar={clearSearchbar}
                actions={[
                    {
                        icon: displayMenuIcon(),
                        color: theme.textColorSecondary,
                        onPress: () =>
                            dispatch(
                                setAppSettings(
                                    "displayMode",
                                    getNextDisplayMode()
                                )
                            ),
                    },
                    {
                        icon: "earth",
                        color: theme.textColorSecondary,
                        onPress: () => WebBrowser.openBrowserAsync(url),
                    },
                ]}
            />

            {loading ? (
                <LoadingScreen theme={theme} />
            ) : (
                <NovelList
                    data={novels}
                    renderItem={renderItem}
                    ListEmptyComponent={listEmptyComponent()}
                    onScroll={onScroll}
                    ListFooterComponent={
                        !searchText &&
                        page < totalPages &&
                        novels.length && (
                            <View style={{ paddingVertical: 16 }}>
                                <ActivityIndicator color={theme.colorAccent} />
                            </View>
                        )
                    }
                />
            )}
        </View>
    );
};

export default Extension;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
});
