import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";

import { TouchableRipple } from "react-native-paper";

const GlobalSearchNovelCover = ({
    novel,
    theme,
    onPress,
    inLibrary,
    onLongPress,
}) => {
    const { novelName, novelCover } = novel;

    return (
        <View style={{ flex: 1 }}>
            <TouchableRipple
                borderless
                centered
                rippleColor={theme.rippleColor}
                style={styles.novelContainer}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <>
                    <Image
                        source={{ uri: novelCover }}
                        style={[
                            styles.novelCover,
                            inLibrary && { opacity: 0.5 },
                        ]}
                        progressiveRenderingEnabled={true}
                    />
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.title,
                            { color: theme.textColorPrimary },
                        ]}
                    >
                        {novelName}
                    </Text>
                </>
            </TouchableRipple>
        </View>
    );
};

export default GlobalSearchNovelCover;

const styles = StyleSheet.create({
    novelContainer: {
        paddingHorizontal: 5,
        paddingVertical: 4,
        borderRadius: 4,
    },
    novelCover: {
        height: 150,
        width: 115,
        borderRadius: 4,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 4,
        flexWrap: "wrap",
        width: 115,
    },
});
