import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import * as WebBrowser from "expo-web-browser";

import { ScreenContainer } from "../../../Components/Common";
import { Searchbar } from "../../../Components/Searchbar";

import { useTheme } from "../../../Hooks/reduxHooks";
import { scrapeSearchResults, scrapeTopNovels } from "./NovelUpdatesScraper";
import NovelUpdatesNovelCard from "./NovelUpdatesNovelCard";

const BrowseNovelUpdates = ({ navigation }) => {
    const theme = useTheme();

    const [novels, setNovels] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState("");

    const getNovels = async (pageNo) => {
        const data = await scrapeTopNovels(pageNo);

        setNovels((novels) => novels.concat(data));
        setLoading(false);
    };

    useEffect(() => {
        getNovels(1);
    }, []);

    const getSearchResults = async () => {
        setLoading(true);

        const data = await scrapeSearchResults(searchText);
        setNovels(data);
        setLoading(false);
    };

    const clearSearchbar = () => {
        getNovels();
        setLoading(true);
        setSearchText("");
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

    return (
        <ScreenContainer theme={theme}>
            <Searchbar
                theme={theme}
                placeholder="Search Novel Updates"
                backAction="arrow-left"
                onBackAction={navigation.goBack}
                searchText={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchResults}
                clearSearchbar={clearSearchbar}
                actions={[
                    {
                        icon: "earth",
                        onPress: () =>
                            WebBrowser.openBrowserAsync(
                                "https://www.novelupdates.com/"
                            ),
                    },
                ]}
            />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size={60} color={theme.colorAccent} />
                </View>
            ) : (
                <FlatList
                    data={novels}
                    keyExtractor={(item) => item.novelName.toString()}
                    renderItem={({ item }) => (
                        <NovelUpdatesNovelCard
                            novel={item}
                            theme={theme}
                            onPress={() =>
                                navigation.navigate("GlobalSearch", {
                                    novelName: item.novelName,
                                })
                            }
                        />
                    )}
                    onScroll={({ nativeEvent }) => {
                        if (!searchText && isCloseToBottom(nativeEvent)) {
                            getNovels(pageNo + 1);
                            setPageNo((pageNo) => pageNo + 1);
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
        </ScreenContainer>
    );
};

export default BrowseNovelUpdates;

const styles = StyleSheet.create({});
