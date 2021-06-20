import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { TouchableRipple, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const NovelUpdatesCard = ({ theme }) => {
    const navigation = useNavigation();

    const navigateToExtension = () => navigation.navigate("BrowseNovelUpdates");

    return (
        <TouchableRipple
            style={styles.extensionCard}
            onPress={navigateToExtension}
            rippleColor={theme.rippleColor}
        >
            <>
                <Image
                    source={require("../../../../assets/novelupdates.png")}
                    style={styles.extensionIcon}
                    resizeMode="contain"
                />
                <View style={styles.extensionDetails}>
                    <View>
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                fontSize: 14,
                            }}
                        >
                            Novel Updates
                        </Text>
                    </View>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Button
                            labelStyle={{ letterSpacing: 0 }}
                            uppercase={false}
                            color={theme.colorAccent}
                            onPress={navigateToExtension}
                        >
                            Browse
                        </Button>
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default NovelUpdatesCard;

const styles = StyleSheet.create({
    extensionCard: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    extensionIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    extensionDetails: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 16,
    },
    sourceStatus: {
        color: "#C14033",
        fontSize: 12,
        marginLeft: 5,
    },
});
