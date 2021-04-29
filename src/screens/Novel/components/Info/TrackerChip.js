import React from "react";
import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TrackerChip = ({ isTracked, trackerSheetRef, theme }) => {
    const getIconName = () => (isTracked ? "check" : "sync");

    const getChipLabel = () => (isTracked ? "Tracked" : "Tracking");

    return (
        <Chip
            mode="outlined"
            icon={() => (
                <MaterialCommunityIcons
                    name={getIconName(isTracked)}
                    size={21}
                    color={theme.colorAccentDark}
                />
            )}
            onPress={() => trackerSheetRef.current.show()}
            style={[
                styles.toggleFavourite,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
            textStyle={{
                fontWeight: "bold",
                color: theme.textColorPrimary,
            }}
        >
            {getChipLabel()}
        </Chip>
    );
};

export default TrackerChip;

const styles = StyleSheet.create({
    toggleFavourite: {
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 4,
        marginLeft: 0,
        borderWidth: 0,
        elevation: 0,
    },
});
