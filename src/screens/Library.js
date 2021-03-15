import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { Appbar } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

import NovelCover from "../components/common/NovelCover";

import { connect } from "react-redux";

import { useSelector } from "react-redux";

import {
    getLibraryNovels,
    searchLibraryNovels,
} from "../redux/actions/library";

const LibraryScreen = ({
    navigation,
    novels,
    loading,
    getLibraryNovels,
    searchLibraryNovels,
}) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    // const itemsPerRow = useSelector((state) => state.settingsReducer.itemsPerRow);

    const [refreshing, setRefreshing] = useState(false);

    const [searchBar, setSearchBar] = useState(false);
    const [searchText, setSearchText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setSearchBar(false);
            getLibraryNovels();
        }, [])
    );

    const onRefresh = () => {
        ToastAndroid.show("Updating library", ToastAndroid.SHORT);
        setRefreshing(true);
        getLibraryNovels();
        setRefreshing(false);
    };

    return (
        <>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                {!searchBar ? (
                    <>
                        <Appbar.Content
                            title="Library"
                            titleStyle={{ color: theme.textColorPrimaryDark }}
                        />
                        <Appbar.Action
                            icon="magnify"
                            onPress={() => setSearchBar(true)}
                            color={theme.textColorPrimaryDark}
                        />
                        <Appbar.Action
                            color={theme.textColorPrimaryDark}
                            icon="filter-variant"
                            disabled
                            // onPress={() => _panel.show({ velocity: -1.5 })}
                        />
                    </>
                ) : (
                    <>
                        <Appbar.BackAction
                            onPress={() => {
                                setSearchBar(false);
                                setSearchText("");
                                getLibraryNovels();
                            }}
                            color={theme.textColorPrimaryDark}
                            size={24}
                        />
                        <TextInput
                            placeholder="Search..."
                            defaultValue={searchText}
                            style={{
                                fontSize: 18,
                                flex: 1,
                                color: theme.textColorPrimaryDark,
                                marginLeft: 15,
                            }}
                            autoFocus
                            placeholderTextColor={theme.textColorHintDark}
                            blurOnSubmit={true}
                            onChangeText={(text) => {
                                setSearchText(text);
                                searchLibraryNovels(text);
                            }}
                        />
                        {searchText !== "" && (
                            <Appbar.Action
                                icon="close"
                                onPress={() => {
                                    setSearchText("");
                                    // getLibrary();
                                }}
                                color={theme.textColorPrimaryDark}
                            />
                        )}
                    </>
                )}
            </Appbar.Header>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorDarkPrimaryDark },
                ]}
            >
                <FlatList
                    contentContainerStyle={{ flex: 1 }}
                    numColumns={3}
                    data={novels}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.novelUrl}
                    renderItem={({ item }) => (
                        <NovelCover
                            item={item}
                            onPress={() =>
                                navigation.navigate("NovelItem", {
                                    ...item,
                                    navigatingFrom: 1,
                                })
                            }
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
                        !loading ? (
                            !searchBar ? (
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            fontSize: 45,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Σ(ಠ_ಠ)
                                    </Text>
                                    <Text
                                        style={{
                                            color: theme.textColorSecondaryDark,
                                            fontWeight: "bold",
                                            marginTop: 10,
                                            textAlign: "center",
                                            paddingHorizontal: 30,
                                        }}
                                    >
                                        Your library is empty. Add series to
                                        your library from Browse.
                                    </Text>
                                </View>
                            ) : (
                                searchBar &&
                                searchText !== "" && (
                                    <Text
                                        style={{
                                            color: theme.colorAccentDark,
                                            fontWeight: "bold",
                                            marginTop: 10,
                                            textAlign: "center",
                                            paddingHorizontal: 30,
                                        }}
                                    >
                                        {`"${searchText}" not in library`}
                                    </Text>
                                )
                            )
                        ) : (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                />
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    novels: state.libraryReducer.novels,
    loading: state.libraryReducer.loading,
});

export default connect(mapStateToProps, {
    getLibraryNovels,
    searchLibraryNovels,
})(LibraryScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
});
