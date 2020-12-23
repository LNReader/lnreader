import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MoreScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={{ color: "#FFFFFF" }}>Library</Text>
        </View>
    );
};

export default MoreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
    },
});
