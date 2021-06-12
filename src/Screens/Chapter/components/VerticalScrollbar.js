import React from "react";

import Slider from "@react-native-community/slider";
import { Dimensions, View, Text } from "react-native";

const VerticalScrollbar = ({
    theme,
    hide,
    contentSize,
    scrollPercentage,
    setLoading,
    scrollViewRef,
    setScrollPercentage,
}) => {
    if (hide) {
        return null;
    } else {
        return (
            <View
                style={[
                    {
                        position: "absolute",
                        zIndex: 2,
                        // top: 0,
                        right: -(Dimensions.get("window").width / 2) + 40,
                        bottom: 300,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        borderRadius: 50,
                        marginHorizontal: 8,
                        transform: [{ rotate: "90deg" }],
                    },
                ]}
            >
                <Text
                    style={{
                        color: theme.textColorPrimary,
                        marginLeft: 16,
                        transform: [{ rotate: "-90deg" }],
                    }}
                >
                    {scrollPercentage}
                </Text>
                <Slider
                    style={{
                        flex: 1,
                        // width: Dimensions.get("window").width - 100,
                        height: 40,
                        // paddingHorizontal: 8,
                    }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={scrollPercentage}
                    onSlidingComplete={(value) => {
                        setLoading(true);
                        setScrollPercentage(value);
                        scrollViewRef.current.scrollTo({
                            x: 0,
                            y: Math.round((value * contentSize) / 100),
                            animated: false,
                        });
                        setLoading(false);
                    }}
                    thumbTintColor={theme.colorAccent}
                    minimumTrackTintColor={theme.colorAccent}
                    maximumTrackTintColor="#000000"
                />
                <Text
                    style={{
                        color: theme.textColorPrimary,
                        marginRight: 16,
                        transform: [{ rotate: "-90deg" }],
                    }}
                >
                    100
                </Text>
            </View>
        );
    }
};

export default VerticalScrollbar;
