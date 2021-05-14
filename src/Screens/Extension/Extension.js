import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";

import NovelCover from "../../Components/NovelCover";
import EmptyView from "../../Components/EmptyView";

import { Searchbar } from "../../Components/Searchbar";
import { useTheme, useLibrary } from "../../Hooks/reduxHooks";
import NovelList from "../../Components/NovelList";
import { showToast } from "../../Hooks/showToast";

const Extension = ({ navigation, route }) => {
    const { sourceId, sourceName, sourceUrl } = route.params;

    const theme = useTheme();
    const library = useLibrary();

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();

    const [searchText, setSearchText] = useState("");

    const getSourceUrl = () => {
        if (sourceId === 1) {
            return `https://lnreader-extensions.vercel.app/api/1/novels/1/?o=rating`;
        } else {
            return `https://lnreader-extensions.vercel.app/api/${sourceId}/novels/`;
        }
    };

    const getSearchUrl = () => {
        if (sourceId === 1) {
            return `https://lnreader-extensions.vercel.app/api/1/search/?s=${searchText}&?o=rating`;
        } else {
            return `https://lnreader-extensions.vercel.app/api/${sourceId}/search/?s=${searchText}`;
        }
    };

    const getNovels = () => {
        fetch(getSourceUrl())
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            })
            .catch((error) => {
                setNovels([]);
                setLoading(false);
                showToast(error.message);
            });
    };

    const clearSearchbar = () => {
        getNovels();
        setLoading(true);
        setSearchText("");
    };

    const getSearchResults = () => {
        setLoading(true);
        fetch(getSearchUrl())
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            })
            .catch((error) => {
                setNovels([]);
                setLoading(false);
                showToast(error.message);
            });
    };

    const checkIFInLibrary = (sourceId, novelUrl) => {
        return library.some(
            (obj) => obj.novelUrl === novelUrl && obj.sourceId === sourceId
        );
    };

    useEffect(() => {
        getNovels();
    }, []);

    const renderItem = ({ item }) => (
        <NovelCover
            item={item}
            onPress={() =>
                navigation.navigate("Novel", {
                    novelName: item.novelName,
                    novelCover: item.novelCover,
                    novelUrl: item.novelUrl,
                    sourceId: item.extensionId,
                })
            }
            libraryStatus={checkIFInLibrary(item.extensionId, item.novelUrl)}
        />
    );

    const listEmptyComponent = () =>
        novels.length === 0 && (
            <EmptyView icon="(；￣Д￣)" description="No results found" />
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
                placeholder={`Search ${sourceName}`}
                left="arrow-left"
                onPressLeft={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchResults}
                clearSearchbar={clearSearchbar}
                right="earth"
                displayMenu={true}
                onPressRight={() => WebBrowser.openBrowserAsync(sourceUrl)}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size={60} color={theme.colorAccent} />
                </View>
            ) : (
                <NovelList
                    data={novels}
                    renderItem={renderItem}
                    ListEmptyComponent={listEmptyComponent()}
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
