import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import { IconButton } from "react-native-paper";

export const Actionbar = ({ actions, theme }) => {
    return (
        <View
            style={[
                styles.actionbarContainer,
                { backgroundColor: theme.colorPrimary },
            ]}
        >
            {actions.map(
                (action, index) =>
                    action.icon && (
                        <IconButton
                            key={index}
                            icon={action.icon}
                            color={theme.textColorPrimary}
                            onPress={action.onPress}
                        />
                    )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    actionbarContainer: {
        position: "absolute",
        width: Dimensions.get("window").width - 32,
        bottom: 0,
        margin: 16,
        borderRadius: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingVertical: 4,
        elevation: 2,
    },
});
