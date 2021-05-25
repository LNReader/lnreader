import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import EmptyView from "../../Components/EmptyView";
import {
    getUpdatesAction,
    updateLibraryAction,
} from "../../redux/updates/updates.actions";
import { Appbar } from "./components/Appbar";
import UpdatesItem from "./components/UpdatesItem";
import { useTheme } from "../../Hooks/reduxHooks";
import { Searchbar } from "../../Components/Searchbar";

const Updates = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { updates, loading } = useSelector((state) => state.updatesReducer);

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

    const onPress = (item) =>
        navigation.navigate("Chapter", {
            chapterId: item.chapterId,
            chapterUrl: item.chapterUrl,
            sourceId: item.sourceId,
            novelUrl: item.novelUrl,
            chapterName: item.chapterName,
            novelId: item.novelId,
            novelName: item.novelName,
        });

    const renderItem = ({ item }) => (
        <UpdatesItem item={item} theme={theme} onPress={() => onPress(item)} />
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
        let results = updates.filter((update) =>
            update.novelName.toLowerCase().includes(text.toLowerCase())
        );
        setSearchResults(results);
    };

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
                left="magnify"
                theme={theme}
                right="reload"
                onPressRight={() => dispatch(updateLibraryAction())}
            />
            <FlatList
                contentContainerStyle={styles.flatList}
                data={searchText ? searchResults : updates}
                keyExtractor={(item) => item.updateId.toString()}
                renderItem={renderItem}
                ListFooterComponent={ListFooterComponent()}
                ListEmptyComponent={ListEmptyComponent()}
                refreshControl={refreshControl()}
            />
        </View>
    );
};

export default Updates;

const styles = StyleSheet.create({
    container: { flex: 1 },
    flatList: { flexGrow: 1, paddingVertical: 8 },
});
