import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const NovelSummary = ({ summary, followed, theme }) => {
    const [more, showMore] = useState(!followed);

    return (
        summary !== "" && (
            <View style={styles.summaryContainer}>
                <Text
                    style={[
                        { color: theme.textColorPrimary },
                        styles.summaryHeader,
                    ]}
                >
                    About
                </Text>
                <Text
                    style={{
                        color: theme.textColorSecondary,
                        lineHeight: 20,
                    }}
                    numberOfLines={more ? 200 : 2}
                    onPress={() => showMore(!more)}
                    ellipsizeMode="clip"
                >
                    {summary}
                </Text>
                <Text
                    style={[
                        {
                            color: theme.colorAccent,
                            backgroundColor: theme.colorPrimaryDark,
                        },
                        styles.showMoreButton,
                    ]}
                    onPress={() => showMore(!more)}
                >
                    {more ? "Less" : "More"}
                </Text>
            </View>
        )
    );
};

export default NovelSummary;

const styles = StyleSheet.create({
    summaryContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    summaryHeader: {
        marginTop: 5,
        paddingVertical: 5,
        fontSize: 15,
        fontWeight: "bold",
    },
    showMoreButton: {
        fontWeight: "bold",
        position: "absolute",
        bottom: 0,
        right: 18,
        paddingLeft: 6,
    },
});
