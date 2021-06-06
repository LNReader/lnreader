import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, FlatList } from "react-native";
import * as WebBrowser from "expo-web-browser";

import NovelCover from "../../Components/NovelCover";
import EmptyView from "../../Components/EmptyView";

import { Searchbar } from "../../Components/Searchbar";
import { useTheme, useSettings } from "../../Hooks/reduxHooks";

import { showToast } from "../../Hooks/showToast";
import ErrorView from "../../Components/ErrorView";
import { getDeviceOrientation } from "../../Services/utils/helpers";

const BrowseMalScreen = ({ navigation, route }) => {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();
    const [error, setError] = useState();
    const [pageNo, setPageNo] = useState(1);

    const [searchText, setSearchText] = useState("");

    const getNovels = async () => {
        try {
            const url = `https://api.jikan.moe/v3/top/manga/1/novels`;

            const res = await fetch(url);
            const data = await res.json();

            setNovels(data.top);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setNovels([]);
            setLoading(false);
            setPageNo(1);
            showToast(error.message);
        }
    };

    // const getNextPage = async () => {
    //     try {
    //         const url = `https://api.jikan.moe/v3/top/manga/${pageNo}/novels`;
    //         console.log(url);

    //         const res = await fetch(url);
    //         const data = await res.json();

    //         setNovels((novels) => novels.concat(data.top));
    //         setPageNo((pageNo) => pageNo + 1);
    //         setLoading(false);
    //     } catch (error) {
    //         setError(error.message);
    //         setNovels([]);
    //         setPageNo(1);
    //         setLoading(false);
    //         showToast(error.message);
    //     }
    // };

    const clearSearchbar = () => {
        getNovels();
        setLoading(true);
        setSearchText("");
    };

    const getSearchResults = () => {
        setLoading(true);

        fetch(
            `https://api.jikan.moe/v3/search/manga?q=${searchText}&page=1&type=novel`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json.results);
                setLoading(false);
            })
            .catch((error) => {
                setNovels([]);
                setLoading(false);
                showToast(error.message);
            });
    };

    // const checkIFInLibrary = (sourceId, novelUrl) => {
    //     return library.some(
    //         (obj) => obj.novelUrl === novelUrl && obj.sourceId === sourceId
    //     );
    // };

    useEffect(() => {
        getNovels();
    }, []);

    const renderItem = ({ item }) => (
        <NovelCover
            item={{ novelName: item.title, novelCover: item.image_url }}
            onPress={() =>
                navigation.navigate("GlobalSearch", {
                    novelName: item.title,
                })
            }
        />
    );

    const { displayMode, novelsPerRow } = useSettings();

    const orientation = getDeviceOrientation();

    const getNovelsPerRow = () => {
        if (displayMode === 2) {
            return 1;
        }

        if (orientation === "landscape") {
            return 6;
        } else {
            return novelsPerRow;
        }
    };

    const isCloseToBottom = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }) => {
        const paddingToBottom = 0;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const onScroll = ({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
            console.log("Close to bototm");
            getNextPage();
        }
    };

    const ListEmptyComponent = () => (
        <ErrorView
            error={error || "No results found"}
            onRetry={() => {
                getNovels();
                setLoading(true);
                setError();
            }}
            openWebView={() =>
                WebBrowser.openBrowserAsync(
                    "https://myanimelist.net/topmanga.php?type=lightnovels"
                )
            }
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
                placeholder="Search MyAnimeList"
                left="arrow-left"
                onPressLeft={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchResults}
                clearSearchbar={clearSearchbar}
                right="earth"
                displayMenu={true}
                onPressRight={() =>
                    WebBrowser.openBrowserAsync(
                        "https://myanimelist.net/topmanga.php?type=lightnovels"
                    )
                }
            />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size={60} color={theme.colorAccent} />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.flatListCont}
                    numColumns={getNovelsPerRow()}
                    key={getNovelsPerRow()}
                    data={novels}
                    keyExtractor={(item) => item.mal_id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={ListEmptyComponent}
                    // onScroll={onScroll}
                    // ListFooterComponent={
                    //     <View
                    //         style={{
                    //             flex: 1,
                    //             justifyContent: "center",
                    //             paddingTop: 16,
                    //             paddingBottom: 8,
                    //         }}
                    //     >
                    //         <ActivityIndicator color={theme.colorAccent} />
                    //     </View>
                    // }
                />
            )}
            {/* <Button title="Grt novels" onPress={() => console.log(novels)} /> */}
        </View>
    );
};

export default BrowseMalScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    flatListCont: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
