import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

const EmptyView = ({ icon, description }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <View style={styles.emptyViewContainer}>
            <Text
                style={[
                    styles.emptyViewIcon,
                    { color: theme.textColorSecondary },
                ]}
            >
                {icon}
            </Text>
            <Text
                style={[
                    styles.emptyViewText,
                    { color: theme.textColorSecondary },
                ]}
            >
                {description}
            </Text>
        </View>
    );
};

export default EmptyView;

const styles = StyleSheet.create({
    emptyViewContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyViewIcon: {
        fontSize: 45,
        fontWeight: "bold",
    },
    emptyViewText: {
        fontWeight: "bold",
        marginTop: 10,
        textAlign: "center",
        paddingHorizontal: 30,
    },
});
