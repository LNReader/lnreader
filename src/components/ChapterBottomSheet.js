import React, { useState } from "react";
import { Animated, StyleSheet, View, Text, Dimensions } from "react-native";
import Bottomsheet from "rn-sliding-up-panel";
import { theme } from "../theming/theme";
import Slider from "@react-native-community/slider";

const ChapterBottomSheet = ({ bottomSheetRef, setSize, size }) => {
    return (
        <Bottomsheet
            // animatedValue={new Animated.Value(0)}
            ref={bottomSheetRef}
            draggableRange={{ top: 200, bottom: 0 }}
            snappingPoints={[0, 200]}
            // showBackdrop={false}
        >
            <View
                style={[
                    styles.contentContainer,
                    {
                        backgroundColor: "rgba(0,0,0,0.3)",
                    },
                ]}
            >
                <View
                    style={{
                        backgroundColor: theme.textColorHintDark,
                        height: 5,
                        width: 30,
                        borderRadius: 50,
                        top: 10,
                        alignSelf: "center",
                    }}
                />

                <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
                    <Text
                        style={{
                            color: theme.textColorPrimaryDark,
                            fontWeight: "bold",
                        }}
                    >
                        Text Size
                    </Text>
                    <Slider
                        style={{
                            width: Dimensions.get("window").width,
                            height: 40,
                        }}
                        value={size}
                        minimumValue={7}
                        maximumValue={28}
                        step={3.5}
                        minimumTrackTintColor={theme.colorAccentDark}
                        maximumTrackTintColor="#000000"
                        thumbTintColor={theme.colorAccentDark}
                        onValueChange={(value) => setSize(value)}
                    />
                    <Text
                        style={{
                            color: theme.textColorPrimaryDark,
                            fontWeight: "bold",
                        }}
                    >
                        Reader Theme{" "}
                    </Text>
                </View>
            </View>
        </Bottomsheet>
    );
};

export default ChapterBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        // paddingTop: ,
        // alignItems: "center",
    },
});
