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

import { useSelector } from "react-redux";

import { getLibraryFromDb, searchInLibrary } from "../services/db";

import { getLibraryNovels } from "../redux/actions/library";

const LibraryScreen = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [novels, setNovels] = useState();

    const [searchBar, setSearchBar] = useState(false);
    const [searchText, setSearchText] = useState("");

    const getLibrary = async () => {
        await getLibraryFromDb().then((res) => {
            setNovels(res);
        });
        setLoading(false);
        setRefreshing(false);
    };

    const searchNovel = async (searchText) => {
        await searchInLibrary(searchText).then((res) => setNovels(res));
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            setSearchBar(false);
            getLibrary();
        }, [])
    );

    const onRefresh = () => {
        ToastAndroid.show("Updating library", ToastAndroid.SHORT);
        setRefreshing(true);
        getLibrary();
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
                                getLibrary();
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
                                searchNovel(text);
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

export default LibraryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
});
