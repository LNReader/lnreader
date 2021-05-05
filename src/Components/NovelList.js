import React from "react";
import { RefreshControl, StyleSheet, FlatList } from "react-native";
import { useSettings } from "../Hooks/reduxHooks";

const NovelList = ({
    data,
    renderItem,
    refreshControl,
    ListEmptyComponent,
}) => {
    const { displayMode, itemsPerRow } = useSettings();
    const getItemsPerRow = () => {
        if (displayMode === 2) {
            return 1;
        } else {
            return itemsPerRow;
        }
    };

    return (
        <FlatList
            contentContainerStyle={styles.flatListCont}
            numColumns={getItemsPerRow()}
            key={getItemsPerRow()}
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
