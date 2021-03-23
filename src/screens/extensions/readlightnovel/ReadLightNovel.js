import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Provider } from "react-native-paper";

import NovelCover from "../../../components/common/NovelCover";
import { SearchAppbar } from "../../../components/common/Appbar";

import { useSelector } from "react-redux";
import EmptyView from "../../../components/common/EmptyView";

const ReadLightNovel = ({ navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);
    const library = useSelector((state) => state.libraryReducer.novels);
    const itemsPerRow = useSelector(
        (state) => state.settingsReducer.itemsPerRow
    );

    const [loading, setLoading] = useState(true);

    const [novels, setNovels] = useState();

    const [searchText, setSearchText] = useState("");

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

    const checkIFInLibrary = (id) => {
        return library.some((obj) => obj.novelUrl === id);
    };

    useEffect(() => {
        getNovels();
    }, []);

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
                    placeholder="Search ReadLightNovel"
                    searchText={searchText}
                    setSearchText={setSearchText}
                    getSearchResults={getSearchResults}
                    getNovels={getNovels}
                    setLoading={setLoading}
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
                        contentContainerStyle={{ flexGrow: 1 }}
                        numColumns={itemsPerRow}
                        key={itemsPerRow}
                        data={novels}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.novelUrl}
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() =>
                                    navigation.navigate("NovelItem", item)
                                }
                                libraryStatus={
                                    checkIFInLibrary(item.novelUrl)
                                        ? true
                                        : false
                                }
                            />
                        )}
                        ListEmptyComponent={
                            searchText !== "" &&
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
        </Provider>
    );
};

export default ReadLightNovel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
    contentContainer: {
        flex: 1,
    },
});
