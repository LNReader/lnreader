import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ScreenContainer = ({ children, theme }) => (
    <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
        {children}
    </View>
);

export { ScreenContainer };

// const styles = StyleSheet.create({});
