import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableRipple, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const ExtensionCard = ({ item, theme }) => {
    const { sourceName, sourceCover, sourceLanguage, status } = item;

    const navigation = useNavigation();

    const navigateToExtension = () =>
        navigation.navigate("Extension", {
            sourceId: item.sourceId,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
        });

    return (
        <TouchableRipple
            style={styles.extensionCard}
            onPress={navigateToExtension}
            rippleColor={theme.rippleColor}
        >
            <>
                <Image
                    source={{ uri: sourceCover }}
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
                            {sourceName}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text
                                style={{
                                    color: theme.textColorSecondary,
                                    fontSize: 12,
                                }}
                            >
                                {sourceLanguage}
                            </Text>
                            <Text style={styles.sourceStatus}>
                                {status === 0 && "• Down"}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Button
                            labelStyle={{ letterSpacing: 0 }}
                            uppercase={false}
                            color={theme.colorAccentDark}
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

export default ExtensionCard;

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
