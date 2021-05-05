import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { useTheme } from "../../Hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import { Searchbar } from "../../Components/Searchbar";
import NovelCover from "../../Components/NovelCover";
import NovelList from "../../Components/NovelList";
import EmptyView from "../../Components/EmptyView";

const GlobalSearch = ({ navigation }) => {
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState("");
    const { sources, pinned } = useSelector((state) => state.sourceReducer);

    const pinnedSources = sources.filter(
        (source) => pinned.indexOf(source.sourceId) !== -1
    );

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
                    });
            }, 3000 * index)
        );
    };

    const renderItem = ({ item }) => (
        <>
            <View style={{ padding: 8 }}>
                <Text style={{ color: theme.textColorPrimary }}>
                    {item.sourceName}
                </Text>
                <Text style={{ color: theme.textColorSecondary, fontSize: 12 }}>
                    {item.sourceLanguage}
                </Text>
            </View>
            <NovelList
                data={item.novels}
                renderItem={({ item }) => (
                    <NovelCover
                        item={item}
                        onPress={() =>
                            navigation.navigate("Novel", {
                                ...item,
                                sourceId: item.extensionId,
                            })
                        }
                    />
                )}
                ListEmptyComponent={
                    <Text
                        style={{ color: theme.textColorSecondary, padding: 8 }}
                    >
                        No results found
                    </Text>
                }
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
                left="arrow-left"
                onPressLeft={() => navigation.goBack()}
                searchText={searchText}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                clearSearchbar={clearSearchbar}
            />

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
                    !loading && (
                        <EmptyView
                            icon="__φ(．．)"
                            description="Search a novel in your pinned sources"
                        />
                    )
                }
                ListFooterComponent={
                    loading && (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                padding: 20,
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
