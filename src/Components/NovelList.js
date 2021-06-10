import React from "react";
import { StyleSheet, FlatList } from "react-native";

import { useSettings } from "../Hooks/reduxHooks";
import { getDeviceOrientation } from "../Services/utils/helpers";

const NovelList = ({
    data,
    onScroll,
    renderItem,
    refreshControl,
    ListEmptyComponent,
    ListFooterComponent,
}) => {
    const { displayMode, novelsPerRow } = useSettings();

    const orientation = getDeviceOrientation();

    const getNovelsPerRow = () => {
        if (displayMode === 2) {
            return 1;
        }

        if (orientation === "landscape") {
            return 6;
        } else {
            return novelsPerRow;
        }
    };

    return (
        <FlatList
            contentContainerStyle={styles.flatListCont}
            numColumns={getNovelsPerRow()}
            key={[orientation, getNovelsPerRow()]}
            data={data}
            keyExtractor={(item) => item.novelUrl}
            renderItem={renderItem}
            refreshControl={refreshControl}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            onScroll={onScroll}
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
