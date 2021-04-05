import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableRipple, Button } from "react-native-paper";
import moment from "moment";

import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const UpdateCard = ({ item }) => {
    const navigation = useNavigation();

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            style={styles.updateCard}
            // onPress={() =>
            //     navigation.navigate("ExtensionStack", {
            //         screen: sourceName,
            //     })
            // }
            rippleColor={theme.rippleColor}
            borderless
        >
            <>
                <Image
                    source={{ uri: item.novelCover }}
                    style={styles.updateIcon}
                />
                <View style={styles.extensionDetails}>
                    <View>
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                fontSize: 14,
                            }}
                        >
                            {item.novelName}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text
                                style={{
                                    color: theme.textColorPrimary,
                                    fontSize: 12,
                                }}
                            >
                                {`${item.chapterName} · ${moment(
                                    item.updateTime
                                ).calendar()}`}
                            </Text>
                        </View>
                    </View>
                    {/* <View>
                        <Button
                            labelStyle={{
                                letterSpacing: 0,
                            }}
                            uppercase={false}
                            color={theme.colorAccentDark}
                            onPress={() =>
                                navigation.navigate("ExtensionStack", {
                                    screen: sourceName,
                                })
                            }
                        >
                            Browse
                        </Button>
                    </View> */}
                </View>
            </>
        </TouchableRipple>
    );
};

export default UpdateCard;

const styles = StyleSheet.create({
    updateCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    updateIcon: {
        width: 42,
        height: 42,
        borderRadius: 4,
    },
    extensionDetails: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 16,
    },
});
