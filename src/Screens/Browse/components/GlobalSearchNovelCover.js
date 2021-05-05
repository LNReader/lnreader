import React from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { TouchableRipple } from "react-native-paper";

import { useSettings, useTheme } from "../../../Hooks/reduxHooks";

const GlobalSearchNovelCover = ({ item, onPress, libraryStatus }) => {
    const theme = useTheme();

    const comfortableTitle = () => (
        <Text
            numberOfLines={2}
            style={[
                styles.title,
                {
                    width: 115,
                    color: theme.textColorPrimary,
                    padding: 4,
                    flexWrap: "wrap",
                },
            ]}
        >
            {item.novelName}
        </Text>
    );

    return (
        <View style={{ flex: 1 }}>
            <TouchableRipple
                borderless
                centered
                rippleColor={theme.rippleColor}
                style={styles.opac}
                onPress={onPress}
            >
                <>
                    <ImageBackground
                        source={{ uri: item.novelCover }}
                        style={{ height: 150, width: 115 }}
                        imageStyle={[
                            { borderRadius: 4 },
                            libraryStatus && { opacity: 0.5 },
                        ]}
                        progressiveRenderingEnabled={true}
                    />
                    {comfortableTitle()}
                </>
            </TouchableRipple>
        </View>
    );
};

export default GlobalSearchNovelCover;

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        justifyContent: "flex-end",
        borderRadius: 4,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 8,
    },
    opac: {
        paddingHorizontal: 5,
        paddingVertical: 4,
        borderRadius: 4,
    },
});
