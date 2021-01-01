import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import {
    TouchableRipple,
    Appbar,
    Provider,
    Portal,
    Button,
} from "react-native-paper";
import NovelCover from "../../../components/NovelCover";
import { theme } from "../../../theming/theme";
import { BottomSheet } from "../../../components/BottomSheet";

const AllNovels = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(true);
    const [novels, setNovels] = useState();
    const [sort, setSort] = useState("rating");
    const [pageNo, setPageNo] = useState(2);

    const getNovels = () => {
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/novels/1/?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => setNovels(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setPageNo(2);
                setRefreshing(false);
                setLoading(false);
            });
    };

    const loadMore = () => {
        setRefreshing(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/1/novels/${pageNo}/?o=${sort}`
        )
            .then((response) => response.json())
            .then((json) => setNovels((novels) => novels.concat(json)))
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
                setPageNo(pageNo + 1);
            });
    };

    useEffect(() => {
        getNovels();
    }, [sort]);

    const onRefresh = () => {
        setRefreshing(true);
        setPageNo(2);
        getNovels();
    };

    return (
        <Provider>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />

                <Appbar.Content
                    title="Box Novel"
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                />
                <Appbar.Action
                    icon="magnify"
                    onPress={() => navigation.navigate("BoxNovelSearch")}
                />
                <Appbar.Action
                    icon="filter-variant"
                    onPress={() => _panel.show({ velocity: -1.5 })}
                />
                <Appbar.Action icon="refresh" onPress={() => onRefresh()} />
            </Appbar.Header>
            <View style={styles.container}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size="large"
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
                        ListFooterComponent={() => (
                            <View
                                style={{
                                    width: 120,
                                    alignSelf: "center",
                                    marginVertical: 10,
                                }}
                            >
                                <Button
                                    mode="contained"
                                    color={theme.colorAccentDark}
                                    uppercase={false}
                                    labelStyle={{
                                        color: theme.textColorPrimaryDark,
                                        letterSpacing: 0,
                                    }}
                                    onPress={() => loadMore()}
                                >
                                    Load More
                                </Button>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() =>
                                    navigation.navigate("NovelItem", {
                                        ...item,
                                        navigatingFrom: 2,
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
                    />
                )}
            </View>
            <Portal>
                <BottomSheet
                    bottomSheetRef={(c) => (_panel = c)}
                    setSort={setSort}
                    sort={sort}
                    setRefreshing={setRefreshing}
                />
            </Portal>
        </Provider>
    );
};

export default AllNovels;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
        padding: 3,
    },

    contentContainer: {
        flex: 1,
    },
});
