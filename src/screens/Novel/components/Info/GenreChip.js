import React from "react";
import { Text, StyleSheet } from "react-native";

export const GenreChip = ({ children, theme }) => (
    <Text
        style={[
            styles.genreChip,
            {
                color: theme.colorAccent,
                borderColor: theme.colorAccent,
                backgroundColor: theme.colorPrimary,
            },
        ]}
    >
        {children}
    </Text>
);

const styles = StyleSheet.create({
    genreChip: {
        flex: 1,
        justifyContent: "center",
        paddingVertical: 2,
        paddingHorizontal: 10,
        marginHorizontal: 2,
        fontSize: 13,
        borderWidth: 1,
        borderRadius: 50,
    },
});
