import React from "react";
import { StyleSheet, FlatList, Text } from "react-native";
import GlobalSearchNovelCover from "./GlobalSearchNovelCover";

const GlobalSearchNovelList = ({ data, theme, library, navigation }) => {
    const checkIFInLibrary = (sourceId, novelUrl) => {
        return library.some(
            (obj) => obj.novelUrl === novelUrl && obj.sourceId === sourceId
        );
    };

    const renderItem = ({ item }) => (
        <GlobalSearchNovelCover
            item={item}
            onPress={() =>
                navigation.navigate("Novel", {
                    ...item,
                    sourceId: item.extensionId,
                })
            }
            libraryStatus={checkIFInLibrary(item.extensionId, item.novelUrl)}
        />
    );

    return (
        <FlatList
            contentContainerStyle={styles.flatListCont}
            horizontal={true}
            data={data}
            keyExtractor={(item) => item.novelUrl}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text
                    style={{
                        color: theme.textColorSecondary,
                        padding: 8,
                        paddingVertical: 4,
                    }}
                >
                    No results found
                </Text>
            }
        />
    );
};

export default GlobalSearchNovelList;

const styles = StyleSheet.create({
    flatListCont: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
