import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useTheme } from "../../Hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import {
    getSourcesAction,
    searchSourcesAction,
} from "../../redux/source/source.actions";

import SourceCard from "./components/SourceCard";
import { showToast } from "../../Hooks/showToast";
import { Searchbar } from "../../Components/Searchbar";

const Browse = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    // const [globalSearch, setGlobalSearch] = useState(false);
    // const [searchResult, setSearchResults] = useState();
    const { sources, search, loading, pinned } = useSelector(
        (state) => state.sourceReducer
    );
    const theme = useTheme();
    const dispatch = useDispatch();

    const isPinned = (sourceId) =>
        pinned.indexOf(sourceId) === -1 ? false : true;

    useEffect(() => {
        dispatch(getSourcesAction());
    }, [getSourcesAction]);

    const onRefresh = () => {
        showToast("Updating extension list");
        setRefreshing(true);
        getSourcesAction();
        setRefreshing(false);
    };

    const clearSearchbar = () => {
        setSearchText("");
    };

    const onChangeText = (text) => {
        setSearchText(text);
        dispatch(searchSourcesAction(text));
    };

    // const onSubmitEditing = () => {};

    const renderItem = ({ item }) => (
        <SourceCard
            item={item}
            isPinned={isPinned(item.sourceId)}
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
                placeholder="Search Source"
                left="magnify"
                onPressLeft={clearSearchbar}
                searchText={searchText}
                onChangeText={onChangeText}
                clearSearchbar={clearSearchbar}
                right="book-search"
                onPressRight={() => navigation.navigate("GlobalSearch")}
                migrate="swap-vertical-variant"
                onPressMigrate={() => navigation.navigate("Migration")}
            />

            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={!searchText ? sources : search}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
                extraData={pinned}
                ListHeaderComponent={
                    <View>
                        {pinned.length > 0 && (
                            <FlatList
                                contentContainerStyle={{ paddingBottom: 16 }}
                                data={sources.filter((source) =>
                                    isPinned(source.sourceId)
                                )}
                                keyExtractor={(item) =>
                                    item.sourceId.toString()
                                }
                                renderItem={renderItem}
                                extraData={pinned}
                                ListHeaderComponent={
                                    <Text
                                        style={{
                                            color: theme.textColorSecondary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                        }}
                                    >
                                        Pinned
                                    </Text>
                                }
                            />
                        )}
                        <Text
                            style={{
                                color: theme.textColorSecondary,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                            }}
                        >
                            Sources
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    loading && (
                        <ActivityIndicator
                            size="small"
                            color={theme.colorAccent}
                            style={{ marginTop: 16 }}
                        />
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["white"]}
                        progressBackgroundColor={theme.colorAccent}
                    />
                }
            />
        </View>
    );
};

export default Browse;

const styles = StyleSheet.create({
    container: { flex: 1 },
});
