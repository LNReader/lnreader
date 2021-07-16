import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, FlatList } from "react-native";

import * as WebBrowser from "expo-web-browser";

import NovelCover from "../../components/NovelCover";
import { Searchbar } from "../../components/Searchbar/Searchbar";
import ErrorView from "../../components/ErrorView";

import { useTheme, useSettings } from "../../hooks/reduxHooks";
import { showToast } from "../../hooks/showToast";
import { getDeviceOrientation } from "../../services/utils/helpers";
import { scrapeSearchResults } from "./discover/MyAnimeListScraper";

const BrowseMalScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const settings = useSettings();

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();
    const [error, setError] = useState();

    const [searchText, setSearchText] = useState("");

    const baseUrl = "https://api.jikan.moe/v3/";
    const malUrl = "https://myanimelist.net/topmanga.php?type=lightnovels";

    const getNovels = async () => {
        try {
            const url = `${baseUrl}top/manga/1/novels`;

            const res = await fetch(url);
            const data = await res.json();

            setNovels(data.top);
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
        <NovelCover
            item={{ novelName: item.title, novelCover: item.image_url }}
            onPress={() =>
                navigation.navigate("GlobalSearch", {
                    novelName: item.title,
                })
            }
            theme={theme}
        />
    );

    const { displayMode, novelsPerRow } = settings;

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
                    numColumns={getNovelsPerRow()}
                    key={getNovelsPerRow()}
                    data={novels}
                    keyExtractor={(item) => item.mal_id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={ListEmptyComponent}
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
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
