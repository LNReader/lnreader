import React, { useState, useCallback, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    RefreshControl,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { connect } from "react-redux";

import NovelCover from "../../components/NovelCover";
import EmptyView from "../../components/EmptyView";

import {
    getLibraryAction,
    searchLibraryAction,
} from "../../redux/library/library.actions";
import { SearchAppbar } from "../../components/Appbar";
import { setNovel } from "../../redux/novel/novel.actions";
import { updateAllNovels } from "../../services/updates";

const LibraryScreen = ({
    navigation,
    theme,
    novels,
    loading,
    getLibraryAction,
    searchLibraryAction,
    setNovel,
    itemsPerRow,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const [searchText, setSearchText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setSearchText("");
            getLibraryAction();
        }, [getLibraryAction])
    );

    /**
     * TODO: fix refreshing
     */
    const onRefresh = () => {
        ToastAndroid.show("Updating library", ToastAndroid.SHORT);
        setRefreshing(true);
        updateAllNovels();
        setRefreshing(false);
    };

    const redirectToNovel = (item) => {
        navigation.navigate("NovelItem", item);
        setNovel(item);
    };

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <SearchAppbar
                    screen="Library"
                    placeholder="Search Library"
                    getNovels={getLibraryAction}
                    getSearchResults={searchLibraryAction}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={theme.colorAccentDark}
                    />
                ) : (
                    <FlatList
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 8,
                        }}
                        numColumns={itemsPerRow}
                        key={itemsPerRow}
                        data={novels}
                        keyExtractor={(item) => item.novelUrl}
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() => redirectToNovel(item)}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["white"]}
                                progressBackgroundColor={theme.colorAccentDark}
                            />
                        }
                        ListEmptyComponent={
                            searchText !== "" ? (
                                <Text
                                    style={[
                                        styles.emptySearch,
                                        { color: theme.colorAccentDark },
                                    ]}
                                >
                                    {`"${searchText}" not in library`}
                                </Text>
                            ) : (
                                <EmptyView
                                    icon="Σ(ಠ_ಠ)"
                                    description="Your library is empty. Add series to your library from Browse."
                                />
                            )
                        }
                    />
                )}
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    itemsPerRow: state.settingsReducer.itemsPerRow,
    novels: state.libraryReducer.novels,
    loading: state.libraryReducer.loading,
});

export default connect(mapStateToProps, {
    getLibraryAction,
    searchLibraryAction,
    setNovel,
})(LibraryScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
    emptySearch: {
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 16,
    },
});
