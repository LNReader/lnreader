import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableRipple, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { pinSourceAction } from "../../../redux/source/source.actions";

const MigrationSourceCard = ({
    item,
    theme,
    noOfNovels,
    onPress,
    buttonLabel,
}) => {
    const { sourceId, sourceName, sourceCover, sourceLanguage, status } = item;

    return (
        <TouchableRipple
            style={styles.extensionCard}
            onPress={onPress}
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
                            {sourceName} {` (${noOfNovels || 0})`}
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
                        </View>
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default MigrationSourceCard;

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
