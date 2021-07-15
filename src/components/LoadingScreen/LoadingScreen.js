import React from "react";
import { ActivityIndicator, View } from "react-native";

export const LoadingScreen = ({ theme }) => (
    <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size={50} color={theme.colorAccent} />
    </View>
);
