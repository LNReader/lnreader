import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, FlatList } from "react-native";

import * as WebBrowser from "expo-web-browser";

import { Searchbar } from "../../../components/Searchbar";
import ErrorView from "../../../components/ErrorView";

import { useTheme, useSettings } from "../../../hooks/reduxHooks";
import { showToast } from "../../../hooks/showToast";
import { getDeviceOrientation } from "../../../services/utils/helpers";
import { scrapeSearchResults, scrapeTopNovels } from "./MyAnimeListScraper";
import BrowseMalCard from "./BrowseMalCard";

const BrowseMalScreen = ({ navigation, route }) => {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState([]);
    const [error, setError] = useState();
    const [limit, setLimit] = useState(0);

    const [searchText, setSearchText] = useState("");

    const malUrl = "https://myanimelist.net/topmanga.php?type=lightnovels";

    const getNovels = async (limit) => {
        try {
            const data = await scrapeTopNovels(limit);

            setNovels((novels) => novels.concat(data));
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setNovels([]);
            setLoading(false);
            showToast(error.message);
        }
    };

    const clearSearchbar = () => {
        getNovels();
        setLoading(true);
        setSearchText("");
    };

    const getSearchResults = async () => {
        try {
            setLoading(true);

            const data = await scrapeSearchResults(searchText);

            setNovels(data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setNovels([]);
            setLoading(false);
            showToast(error.message);
        }
    };

    useEffect(() => {
        getNovels();
    }, []);

    const renderItem = ({ item }) => (
        <BrowseMalCard
            novel={item}
            theme={theme}
            onPress={() =>
                navigation.navigate("GlobalSearch", {
                    novelName: item.novelName,
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
        const paddingToBottom = 20;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const ListEmptyComponent = () => (
        <ErrorView
            error={error || "No results found"}
            onRetry={() => {
                getNovels();
                setLoading(true);
                setError();
            }}
            openWebView={() => WebBrowser.openBrowserAsync(topNovelsUrl)}
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
                backAction="arrow-left"
                onBackAction={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchResults}
                clearSearchbar={clearSearchbar}
                actions={[
                    {
                        icon: "earth",
                        onPress: () => WebBrowser.openBrowserAsync(malUrl),
                    },
                ]}
            />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size={60} color={theme.colorAccent} />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.novelsContainer}
                    data={novels}
                    keyExtractor={(item) => item.novelName}
                    renderItem={renderItem}
                    ListEmptyComponent={ListEmptyComponent}
                    onScroll={({ nativeEvent }) => {
                        if (!searchText && isCloseToBottom(nativeEvent)) {
                            getNovels(limit + 50);
                            setLimit((limit) => limit + 50);
                        }
                    }}
                    ListFooterComponent={
                        !searchText && (
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

export default BrowseMalScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    novelsContainer: {
        flexGrow: 1,
        paddingBottom: 8,
        paddingHorizontal: 4,
    },
});
