import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import EmptyView from "../../components/EmptyView";
import {
    getUpdatesAction,
    updateLibraryAction,
} from "../../redux/updates/updates.actions";
import UpdatesItem from "./components/UpdatesItem";
import { useTheme } from "../../hooks/reduxHooks";
import { Searchbar } from "../../components/Searchbar/Searchbar";

import moment from "moment";
import { dateFormat } from "../../services/utils/constants";
import {
    deleteChapterAction,
    downloadChapterAction,
} from "../../redux/novel/novel.actions";

const Updates = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { updates, loading } = useSelector((state) => state.updatesReducer);
    const { downloadQueue } = useSelector((state) => state.downloadsReducer);

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            dispatch(getUpdatesAction());
        }, [getUpdatesAction])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        dispatch(updateLibraryAction());
        setRefreshing(false);
    };

    const onPress = useCallback(
        (item) =>
            navigation.navigate("Chapter", {
                chapterId: item.chapterId,
                chapterUrl: item.chapterUrl,
                sourceId: item.sourceId,
                novelUrl: item.novelUrl,
                chapterName: item.chapterName,
                novelId: item.novelId,
                novelName: item.novelName,
                bookmark: item.bookmark,
            }),
        []
    );

    const onPressCover = useCallback(
        (item) =>
            navigation.navigate("Novel", {
                sourceId: item.sourceId,
                novelUrl: item.novelUrl,
                novelName: item.novelName,
                novelCover: item.novelCover,
            }),
        []
    );

    const downloadChapter = (
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterId
    ) =>
        dispatch(
            downloadChapterAction(
                sourceId,
                novelUrl,
                chapterUrl,
                chapterName,
                chapterId
            )
        );

    const deleteChapter = (chapterId, chapterName) => {
        dispatch(deleteChapterAction(chapterId, chapterName));
        dispatch(getUpdatesAction());
    };

    const renderItem = ({ item }) => (
        <UpdatesItem
            item={item}
            theme={theme}
            onPress={() => onPress(item)}
            onPressCover={() => onPressCover(item)}
            downloadQueue={downloadQueue}
            deleteChapter={deleteChapter}
            downloadChapter={downloadChapter}
        />
    );

    const ListFooterComponent = () =>
        loading && <ActivityIndicator size="small" color={theme.colorAccent} />;

    const ListEmptyComponent = () =>
        !loading && (
            <EmptyView icon="(˘･_･˘)" description="No recent updates" />
        );

    const refreshControl = () => (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["white"]}
            progressBackgroundColor={theme.colorAccent}
        />
    );

    const clearSearchbar = () => {
        setSearchText("");
    };

    const onChangeText = (text) => {
        setSearchText(text);
        let results = [];

        text !== "" &&
            updates.map((item) => {
                const date = item.date;
                const chapters = item.chapters.filter((chapter) =>
                    chapter.novelName.toLowerCase().includes(text.toLowerCase())
                );

                if (chapters.length > 0) {
                    results.push({
                        date,
                        chapters,
                    });
                }
            });

        setSearchResults(results);
    };

    const keyExtractor = useCallback((item) => item.updateId.toString(), []);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <Searchbar
                placeholder="Search Updates"
                searchText={searchText}
                clearSearchbar={clearSearchbar}
                onChangeText={onChangeText}
                backAction="magnify"
                theme={theme}
                actions={[
                    {
                        icon: "reload",
                        onPress: () => dispatch(updateLibraryAction()),
                    },
                ]}
            />
            <FlatList
                contentContainerStyle={styles.flatList}
                data={searchText ? searchResults : updates}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <FlatList
                        ListHeaderComponent={
                            <Text
                                style={{
                                    paddingHorizontal: 16,
                                    textTransform: "uppercase",
                                    paddingVertical: 8,
                                    color: theme.textColorSecondary,
                                }}
                            >
                                {moment(item.date).calendar(null, dateFormat)}
                            </Text>
                        }
                        data={item.chapters}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                    />
                )}
                ListFooterComponent={<ListFooterComponent />}
                ListEmptyComponent={<ListEmptyComponent />}
                refreshControl={refreshControl()}
            />
        </View>
    );
};

export default Updates;

const styles = StyleSheet.create({
    container: { flex: 1 },
    flatList: { flexGrow: 1, paddingBottom: 8 },
});
