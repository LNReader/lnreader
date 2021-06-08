import React from "react";
import { StyleSheet, View, Text } from "react-native";

import GlobalSearchNovelList from "./GlobalSearchNovelList";

const GlobalSearchSourceItem = ({ source, library, theme, navigation }) => {
    const { sourceName, sourceLanguage, novels } = source;

    return (
        <>
            <View style={styles.sourceContainer}>
                <Text style={{ color: theme.textColorPrimary }}>
                    {sourceName}
                </Text>
                <Text style={{ color: theme.textColorSecondary, fontSize: 12 }}>
                    {sourceLanguage}
                </Text>
            </View>
            <GlobalSearchNovelList
                data={novels}
                theme={theme}
                library={library}
                navigation={navigation}
            />
        </>
    );
};

export default GlobalSearchSourceItem;

const styles = StyleSheet.create({
    sourceContainer: {
        padding: 8,
        paddingVertical: 16,
    },
});
