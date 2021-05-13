import React from "react";
import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { followNovelAction } from "../../../../redux/novel/novel.actions";

const FollowChip = ({ followed, novel, theme, dispatch }) => {
    const getIconName = () => (followed ? "heart" : "heart-outline");
    const getChipLabel = () => (followed ? "In Library" : "Add to library");

    return (
        <Chip
            mode="outlined"
            icon={() => (
                <MaterialCommunityIcons
                    name={getIconName()}
                    size={21}
                    color={theme.colorAccent}
                />
            )}
            onPress={() => dispatch(followNovelAction(novel))}
            style={[
                { backgroundColor: theme.colorPrimaryDark },
                styles.toggleFavourite,
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

export default FollowChip;

const styles = StyleSheet.create({
    toggleFavourite: {
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 16,
        paddingLeft: 4,
        borderWidth: 0,
        elevation: 0,
    },
});
