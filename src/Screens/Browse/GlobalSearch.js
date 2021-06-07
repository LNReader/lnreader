import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { useLibrary, useTheme } from "../../Hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import { Searchbar } from "../../Components/Searchbar";
import NovelCover from "../../Components/NovelCover";
import NovelList from "../../Components/NovelList";
import EmptyView from "../../Components/EmptyView";
import GlobalSearchNovelList from "./components/GlobalSearchNovelList";
import { ProgressBar } from "react-native-paper";
import { showToast } from "../../Hooks/showToast";

const GlobalSearch = ({ route, navigation }) => {
    const theme = useTheme();
    let novelName = "";

    if (route.params) {
        novelName = route.params.novelName;
    }

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState(novelName);
    const [searchResults, setSearchResults] = useState("");
    const { sources, pinned } = useSelector((state) => state.sourceReducer);
    const [progress, setProgress] = useState(0);

    const library = useLibrary();

    const pinnedSources = sources.filter(
        (source) => pinned.indexOf(source.sourceId) !== -1
    );

    useEffect(() => {
        novelName && onSubmitEditing();
    }, []);

    const clearSearchbar = () => {
        setSearchText("");
    };

    const onChangeText = (text) => setSearchText(text);

    const onSubmitEditing = () => {
        setSearchResults("");

        const getSearchUrl = (sourceId) => {
            if (sourceId === 1) {
                return `https://lnreader-extensions.vercel.app/api/1/search/?s=${searchText}&?o=rating`;
            } else {
                return `https://lnreader-extensions.vercel.app/api/${sourceId}/search/?s=${searchText}`;
            }
        };

        pinnedSources.map((source, index) =>
            setTimeout(() => {
                setLoading(true);
                fetch(getSearchUrl(source.sourceId))
                    .then((response) => response.json())
                    .then((json) => {
                        setSearchResults((searchResults) => [
                            ...searchResults,
                            {
                                sourceId: source.sourceId,
                                sourceName: source.sourceName,
                                sourceLanguage: source.sourceLanguage,
                                novels: json,
                            },
                        ]);
                        setLoading(false);
                    })
                    .catch((error) => {
                        showToast(error.message);
                        setSearchResults((searchResults) => [
                            ...searchResults,
                            {
                                sourceId: source.sourceId,
                                sourceName: source.sourceName,
                                sourceLanguage: source.sourceLanguage,
                                novels: [],
                            },
                        ]);
                        setLoading(false);
                    })
                    .finally(() =>
                        setProgress(
                            (progress) => progress + 1 / pinnedSources.length
                        )
                    );
            }, 1000 * index)
        );
    };

    const renderItem = ({ item }) => (
        <>
            <View style={{ padding: 8, paddingVertical: 16 }}>
                <Text style={{ color: theme.textColorPrimary }}>
                    {item.sourceName}
                </Text>
                <Text style={{ color: theme.textColorSecondary, fontSize: 12 }}>
                    {item.sourceLanguage}
                </Text>
            </View>
            <GlobalSearchNovelList
                data={item.novels}
                theme={theme}
                library={library}
                navigation={navigation}
            />
        </>
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
                placeholder="Global Search"
                backAction="arrow-left"
                onBackAction={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                clearSearchbar={clearSearchbar}
            />
            {progress < 1 && progress > 0 && pinned && (
                <ProgressBar
                    color={
                        progress > 0.9
                            ? theme.colorPrimaryDark
                            : theme.colorAccent
                    }
                    progress={progress}
                />
            )}
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 4,
                }}
                data={searchResults}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
                extraData={pinned}
                ListEmptyComponent={
                    <>
                        {!loading && (
                            <EmptyView
                                icon="__φ(．．)"
                                description={`Search a novel in your pinned sources ${
                                    pinned.length === 0
                                        ? "(No sources pinned)"
                                        : ""
                                }`}
                            />
                        )}
                    </>
                }
                ListFooterComponent={
                    loading && (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                padding: 16,
                            }}
                        >
                            <ActivityIndicator
                                size="large"
                                color={theme.colorAccent}
                            />
                        </View>
                    )
                }
            />
        </View>
    );
};

export default GlobalSearch;

const styles = StyleSheet.create({
    container: { flex: 1 },
});
