import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import {
    TouchableRipple,
    Appbar,
    Provider,
    Portal,
    Button,
} from "react-native-paper";
import { theme } from "../theming/theme";
import { sources } from "../utils/sources";

const Browse = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={sources}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={({ item }) => (
                    <TouchableRipple
                        style={styles.sourceCard}
                        onPress={() =>
                            navigation.navigate(item.sourceName + "Stack")
                        }
                        rippleColor={theme.rippleColorDark}
                    >
                        <>
                            <Image
                                source={{
                                    uri: item.sourceCover,
                                }}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 6,
                                }}
                                resizeMode="contain"
                            />
                            <View style={{ marginLeft: 15 }}>
                                <Text
                                    style={{
                                        color: theme.textColorPrimaryDark,
                                        fontSize: 16,
                                    }}
                                >
                                    {item.sourceName}
                                </Text>
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
                                    }}
                                >
                                    {item.sourceLanguage}
                                </Text>
                            </View>
                        </>
                    </TouchableRipple>
                )}
            />
        </View>
    );
};

export default Browse;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
    sourceCard: {
        // backgroundColor: "pink",
        paddingVertical: 10,
        marginVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
});
