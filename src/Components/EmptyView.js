import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

const EmptyView = ({ icon, description, style, children }) => {
    const theme = useSelector((state) => state.settingsReducer.theme);

    return (
        <View style={styles.emptyViewContainer}>
            <Text
                style={[
                    styles.emptyViewIcon,
                    { color: theme.textColorSecondary },
                    style,
                ]}
            >
                {icon}
            </Text>
            <Text
                style={[
                    styles.emptyViewText,
                    { color: theme.textColorSecondary },
                    style,
                ]}
            >
                {description}
            </Text>
            {children}
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
