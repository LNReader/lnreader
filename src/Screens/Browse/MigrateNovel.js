import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLibrary, useTheme } from "../../Hooks/reduxHooks";
import { useSelector } from "react-redux";

import EmptyView from "../../Components/EmptyView";
import MigrationNovelList from "./components/MigrationNovelList";
import { Appbar } from "../../Components/Appbar";
import { showToast } from "../../Hooks/showToast";

const GlobalSearch = ({ navigation, route }) => {
    const { sourceId, novelName } = route.params;
    const theme = useTheme();

    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState("");
    const { sources, pinned } = useSelector((state) => state.sourceReducer);

    const library = useLibrary();

    const pinnedSources = sources.filter(
        (source) =>
            pinned.indexOf(source.sourceId) !== -1 &&
            source.sourceId !== sourceId
    );

    const getSearchResults = () => {
        const getSearchUrl = (sourceId) => {
            if (sourceId === 1) {
                return `https://lnreader-extensions.vercel.app/api/1/search/?s=${novelName}&?o=rating`;
            } else {
                return `https://lnreader-extensions.vercel.app/api/${sourceId}/search/?s=${novelName}`;
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

    useEffect(() => {
        getSearchResults();
    }, []);

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
            <MigrationNovelList
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
            <Appbar
                title={novelName}
                onBackAction={() => navigation.goBack()}
            />
            {progress < 1 && pinned && (
                <ProgressBar color={theme.colorAccent} progress={progress} />
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
