import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Provider, Portal } from "react-native-paper";

import NovelCover from "../../../components/NovelCover";
import { SearchAppbar } from "../../../components/Appbar";
import { BottomSheet } from "./filters/BottomSheet";

import { useSelector } from "react-redux";

const BoxNovel = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);
    const itemsPerRow = useSelector(
        (state) => state.settingsReducer.itemsPerRow
    );

    const library = useSelector((state) => state.libraryReducer.novels);

    const [loading, setLoading] = useState(true);

    const [novels, setNovels] = useState([]);
    const [sort, setSort] = useState("rating");

    const [searchText, setSearchText] = useState("");

    let bottomSheetRef = useRef(null);

    const getNovels = () => {
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/novels/1/?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const getSearchResults = (searchText) => {
        setLoading(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/search/?s=${searchText}&?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const checkIFInLibrary = (id) => {
        return library.some((obj) => obj.novelUrl === id);
    };

    useEffect(() => {
        getNovels();
    }, [sort]);

    return (
        <Provider>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <SearchAppbar
                    screen="Extension"
                    placeholder="Search BoxNovel"
                    searchText={searchText}
                    setSearchText={setSearchText}
                    getSearchResults={getSearchResults}
                    getNovels={getNovels}
                    setLoading={setLoading}
                    onFilter={() =>
                        bottomSheetRef.current.show({ velocity: -1.5 })
                    }
                />
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
                        numColumns={itemsPerRow}
                        key={itemsPerRow}
                        data={novels}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.novelUrl}
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() => {
                                    navigation.navigate("NovelItem", {
                                        novelName: item.novelName,
                                        novelCover: item.novelCover,
                                        novelUrl: item.novelUrl,
                                        sourceId: item.extensionId,
                                    });
                                }}
                                libraryStatus={
                                    checkIFInLibrary(item.novelUrl)
                                        ? true
                                        : false
                                }
                            />
                        )}
                        ListEmptyComponent={
                            novels.length === 0 && (
                                <EmptyView
                                    icon="(；￣Д￣)"
                                    description="No results found"
                                />
                            )
                        }
                    />
                )}
            </View>
            <Portal>
                <BottomSheet
                    bottomSheetRef={bottomSheetRef}
                    setSort={setSort}
                    sort={sort}
                    setLoading={setLoading}
                />
            </Portal>
        </Provider>
    );
};

export default BoxNovel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },

    contentContainer: {
        flex: 1,
    },
});
