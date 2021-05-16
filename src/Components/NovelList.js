import React from "react";
import { StyleSheet, FlatList } from "react-native";

import { useSettings } from "../Hooks/reduxHooks";

const NovelList = ({
    data,
    renderItem,
    refreshControl,
    ListEmptyComponent,
}) => {
    const { displayMode, novelsPerRow } = useSettings();

    const getNovelsPerRow = () => (displayMode === 2 ? 1 : novelsPerRow);

    return (
        <FlatList
            contentContainerStyle={styles.flatListCont}
            numColumns={getNovelsPerRow()}
            key={getNovelsPerRow()}
            data={data}
            keyExtractor={(item) => item.novelUrl}
            renderItem={renderItem}
            refreshControl={refreshControl}
            ListEmptyComponent={ListEmptyComponent}
        />
    );
};

export default NovelList;

const styles = StyleSheet.create({
    flatListCont: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
