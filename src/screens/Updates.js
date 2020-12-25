import React from "react";
import { StyleSheet, Text, View } from "react-native";

const UpdatesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
                Updates Screen
            </Text>
        </View>
    );
};

export default UpdatesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
        padding: 10,
    },
});
