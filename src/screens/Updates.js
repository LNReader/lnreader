import React from "react";
import { StyleSheet, Text, View } from "react-native";

const UpdatesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={{ color: "#FFFFFF" }}>Update</Text>
        </View>
    );
};

export default UpdatesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
    },
});
