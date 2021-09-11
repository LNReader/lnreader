import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const NovelSummary = ({ summary, followed, theme }) => {
    const [expanded, setExpanded] = useState(!followed);

    const maxNumberOfLines = expanded ? Number.MAX_SAFE_INTEGER : 3;

    const expandNovelSummary = () => setExpanded(!expanded);

    return (
        <View
            style={[
                styles.summaryContainer,
                { paddingBottom: expanded ? 20 : 8 },
            ]}
        >
            <Text
                style={{
                    color: theme.textColorSecondary,
                    lineHeight: 20,
                }}
                numberOfLines={maxNumberOfLines}
                onPress={expandNovelSummary}
                ellipsizeMode="clip"
            >
                {summary}
            </Text>
            <View
                style={{
                    backgroundColor: `${theme.colorPrimaryDark}D1`,
                    position: "absolute",
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    left: 0,
                    right: 0,
                    bottom: expanded ? 0 : 4,
                }}
            >
                <MaterialCommunityIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    color={theme.textColorPrimary}
                    size={24}
                    onPress={expandNovelSummary}
                    style={{
                        borderRadius: 50,
                        backgroundColor: theme.colorPrimaryDark,
                        paddingHorizontal: 2,
                    }}
                />
            </View>
        </View>
    );
};

export default NovelSummary;

const styles = StyleSheet.create({
    summaryContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    showMoreButton: {
        fontWeight: "bold",
        position: "absolute",
        bottom: 0,
        right: 18,
        paddingLeft: 6,
    },
});
