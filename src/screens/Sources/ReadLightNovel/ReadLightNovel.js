import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Appbar, Provider } from "react-native-paper";

import NovelCover from "../../../components/NovelCover";
import HeaderSearchBar from "../../../components/HeaderSearchBar";

import { theme } from "../../../theming/theme";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("lnreader.db");

const ReadLightNovel = ({ navigation }) => {
    const [loading, setLoading] = useState(true);

    const [novels, setNovels] = useState();
    const [libraryNovels, setlibraryNovels] = useState([]);

    const [searchBar, setSearchBar] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [searched, setSearched] = useState(false);

    const getNovels = () => {
        fetch(`https://lnreader-extensions.herokuapp.com/api/2/novels/`)
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const getSearchResults = (searchText) => {
        setLoading(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/2/search/?s=${searchText}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const getLibraryNovels = () => {
        db.transaction((tx) => {
            tx.executeSql(
                "SELECT novelUrl FROM LibraryTable WHERE libraryStatus = 1 AND extensionId = 2",
                null,
                (tx, { rows: { _array } }) => {
                    setlibraryNovels(_array);
                },
                (tx, error) => console.log(error)
            );
        });
    };

    const checkIFInLibrary = (id) => {
        var found = false;
        for (var i = 0; i < libraryNovels.length; i++) {
            if (libraryNovels[i].novelUrl === id) {
                found = true;
                break;
            }
        }
        return found;
    };

    useEffect(() => {
        getNovels();
        getLibraryNovels();
    }, []);

    return (
        <Provider>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                {!searchBar ? (
                    <>
                        <Appbar.BackAction
                            color={theme.textColorPrimaryDark}
                            onPress={() => navigation.goBack()}
                        />

                        <Appbar.Content
                            color={theme.textColorPrimaryDark}
                            title="ReadLightNovel"
                            titleStyle={{ color: theme.textColorPrimaryDark }}
                        />
                        <Appbar.Action
                            color={theme.textColorPrimaryDark}
                            icon="magnify"
                            onPress={() => setSearchBar(true)}
                        />
                        <Appbar.Action
                            icon="filter-variant"
                            disabled
                            color={theme.textColorPrimaryDark}
                        />
                    </>
                ) : (
                    <>
                        <Appbar.BackAction
                            onPress={() => {
                                if (searched) {
                                    setLoading(true);
                                    getNovels();
                                } else {
                                    setSearchBar(false);
                                    setSearchText("");
                                }
                            }}
                            color={theme.textColorPrimaryDark}
                        />
                        <HeaderSearchBar
                            searchText={searchText}
                            onChangeText={(text) => setSearchText(text)}
                            onSubmitEditing={() => {
                                getSearchResults(searchText);
                                setSearched(true);
                            }}
                        />
                        {searchText !== "" && (
                            <Appbar.Action
                                icon="close"
                                onPress={() => {
                                    setSearchText("");
                                }}
                                color={theme.textColorPrimaryDark}
                            />
                        )}
                    </>
                )}
            </Appbar.Header>
            <View style={styles.container}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size={60}
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <FlatList
                        contentContainerStyle={styles.list}
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
                                        navigatingFrom: 2,
                                    })
                                }
                                libraryStatus={
                                    checkIFInLibrary(item.novelUrl)
                                        ? true
                                        : false
                                }
                            />
                        )}
                    />
                )}
            </View>
        </Provider>
    );
};

export default ReadLightNovel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
    contentContainer: {
        flex: 1,
    },
});
