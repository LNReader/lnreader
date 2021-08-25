import React from "react";
import { Dimensions, View, Text, StyleSheet } from "react-native";

import Slider from "@react-native-community/slider";
import { getDeviceOrientation } from "../../../services/utils/helpers";
import FadeView from "../../../components/Common/CrossFadeView";

const VerticalScrollbar = ({
    theme,
    hide,
    contentSize,
    scrollPercentage,
    setLoading,
    scrollViewRef,
}) => {
    const onSlidingComplete = (value) => {
        setLoading(true);
        scrollViewRef.current.scrollTo({
            x: 0,
            y: Math.round((value * contentSize) / 100),
            animated: false,
        });
        setLoading(false);
    };

    if (getDeviceOrientation() === "potrait") {
        return (
            <FadeView
                style={{
                    position: "absolute",
                    zIndex: 2,
                    right: -(Dimensions.get("window").width / 2) + 40,
                    bottom: 300,
                }}
                active={hide}
                animationDuration={150}
            >
                <View
                    style={[
                        styles.verticalSliderContainer,
                        { backgroundColor: `${theme.colorPrimary}E6` },
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
                            height: 40,
                        }}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={scrollPercentage}
                        onSlidingComplete={onSlidingComplete}
                        thumbTintColor={theme.colorAccent}
                        minimumTrackTintColor={theme.colorAccent}
                        maximumTrackTintColor={theme.textColorPrimary}
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
            </FadeView>
        );
    } else {
        return (
            <FadeView active={hide} animationDuration={150}>
                <View style={styles.horizontalSliderContainer}>
                    <Text
                        style={{
                            color: "#FFFFFF",
                            marginLeft: 16,
                        }}
                    >
                        {scrollPercentage}
                    </Text>
                    <Slider
                        style={{
                            flex: 1,
                            height: 40,
                        }}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={scrollPercentage}
                        onSlidingComplete={onSlidingComplete}
                        thumbTintColor={theme.colorAccent}
                        minimumTrackTintColor={theme.colorAccent}
                        maximumTrackTintColor={theme.textColorPrimary}
                    />
                    <Text
                        style={{
                            color: "#FFFFFF",
                            marginRight: 16,
                        }}
                    >
                        100
                    </Text>
                </View>
            </FadeView>
        );
    }
};

export default VerticalScrollbar;

const styles = StyleSheet.create({
    verticalSliderContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        borderRadius: 50,
        marginHorizontal: 8,
        transform: [{ rotate: "90deg" }],
    },
    horizontalSliderContainer: {
        position: "absolute",
        zIndex: 2,
        bottom: 100,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        borderRadius: 50,
        marginHorizontal: 8,
    },
});
