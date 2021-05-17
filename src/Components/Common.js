import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ScreenContainer = ({ children, theme }) => (
    <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
        {children}
    </View>
);

const Row = ({ children }) => <View style={styles.row}>{children}</View>;

export { ScreenContainer, Row };

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
});
