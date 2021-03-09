import React from "react";

import { Animated, StyleSheet, View, Text, Dimensions } from "react-native";
import { ToggleButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import Bottomsheet from "rn-sliding-up-panel";

import { useSelector } from "react-redux";

import { saveReaderTheme } from "../../services/asyncStorage";

const ChapterBottomSheet = ({
    bottomSheetRef,
    setSize,
    size,
    readerTheme,
    setReaderTheme,
}) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Bottomsheet
            animatedValue={new Animated.Value(0)}
            ref={bottomSheetRef}
            draggableRange={{ top: 200, bottom: 0 }}
            snappingPoints={[0, 200]}
            showBackdrop={false}
        >
            <View
                style={[
                    styles.contentContainer,
                    {
                        backgroundColor: "rgba(0,0,0,0.4)",
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
                        minimumValue={12}
                        maximumValue={20}
                        step={4}
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
                        Reader Theme
                    </Text>
                    <ToggleButton.Row
                        onValueChange={(value) => {
                            setReaderTheme(value);
                            saveReaderTheme(value);
                        }}
                        value={readerTheme}
                        style={{ marginTop: 10 }}
                    >
                        <ToggleButton
                            icon="format-text"
                            color="white"
                            value={1}
                            style={{
                                backgroundColor: "black",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-text"
                            color="black"
                            value={2}
                            style={{
                                backgroundColor: "white",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-text"
                            color="black"
                            value={3}
                            style={{
                                backgroundColor: "#F4ECD8",
                                marginHorizontal: 10,
                            }}
                        />
                    </ToggleButton.Row>
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
