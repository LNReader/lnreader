import React from "react";

import { Animated, StyleSheet, View, Text, Dimensions } from "react-native";
import { ToggleButton, IconButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import Bottomsheet from "rn-sliding-up-panel";

import { connect } from "react-redux";

import {
    updateReaderPadding,
    updateReaderTextAlign,
    updateReaderTextSize,
    updateReaderTheme,
} from "../../../redux/settings/settings.actions";
import BottomSheetHandle from "../../../components/BottomSheetHandle";

const ChapterBottomSheet = ({
    bottomSheetRef,
    theme,
    reader,
    updateReaderTextSize,
    updateReaderTheme,
    updateReaderTextAlign,
    updateReaderPadding,
}) => {
    return (
        <Bottomsheet
            animatedValue={new Animated.Value(0)}
            ref={bottomSheetRef}
            draggableRange={{ top: 360, bottom: 0 }}
            snappingPoints={[0, 360]}
            showBackdrop={false}
        >
            <View style={styles.contentContainer}>
                <BottomSheetHandle />
                <View style={styles.readerSettingsContainer}>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
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
                        value={reader.textSize}
                        minimumValue={12}
                        maximumValue={20}
                        step={2}
                        minimumTrackTintColor={theme.colorAccentDark}
                        maximumTrackTintColor="#000000"
                        thumbTintColor={theme.colorAccentDark}
                        onValueChange={(value) => updateReaderTextSize(value)}
                    />
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontWeight: "bold",
                        }}
                    >
                        Reader Theme
                    </Text>
                    <ToggleButton.Row
                        onValueChange={(value) => updateReaderTheme(value)}
                        value={reader.theme}
                        style={{ marginTop: 10 }}
                    >
                        <ToggleButton
                            icon="format-text"
                            color="#FFFFFF"
                            value={1}
                            style={{
                                backgroundColor: "#000000",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-text"
                            color="#000000"
                            value={2}
                            style={{
                                backgroundColor: "#FFFFFF",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-text"
                            color="#000000"
                            value={3}
                            style={{
                                backgroundColor: "#F4ECD8",
                                marginHorizontal: 10,
                            }}
                        />
                    </ToggleButton.Row>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontWeight: "bold",
                            marginTop: 10,
                        }}
                    >
                        Text Align
                    </Text>
                    <ToggleButton.Row
                        onValueChange={(value) =>
                            updateReaderTextAlign(value ?? "left")
                        }
                        value={reader.textAlign}
                        style={{ marginTop: 10 }}
                    >
                        <ToggleButton
                            icon="format-align-left"
                            color="#000000"
                            value="left"
                            style={{
                                backgroundColor: "#FFFFFF",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-align-justify"
                            color="#000000"
                            value="justify"
                            style={{
                                backgroundColor: "#FFFFFF",
                                marginHorizontal: 10,
                            }}
                        />
                        <ToggleButton
                            icon="format-align-right"
                            color="#000000"
                            value="right"
                            style={{
                                backgroundColor: "#FFFFFF",
                                marginHorizontal: 10,
                            }}
                        />
                    </ToggleButton.Row>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontWeight: "bold",
                            marginTop: 10,
                        }}
                    >
                        Padding
                    </Text>
                    <View
                        style={{
                            width: "100%",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <IconButton
                            icon="minus"
                            color={theme.colorAccentDark}
                            size={26}
                            disabled={reader.padding <= 0 ? true : false}
                            onPress={() =>
                                updateReaderPadding(reader.padding - 1)
                            }
                        />
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                paddingHorizontal: 50,
                            }}
                        >
                            {`${reader.padding}%`}
                        </Text>
                        <IconButton
                            icon="plus"
                            color={theme.colorAccentDark}
                            size={26}
                            disabled={reader.padding >= 10 ? true : false}
                            onPress={() =>
                                updateReaderPadding(reader.padding + 1)
                            }
                        />
                    </View>
                </View>
            </View>
        </Bottomsheet>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    reader: state.settingsReducer.reader,
});

export default connect(mapStateToProps, {
    updateReaderTextSize,
    updateReaderTheme,
    updateReaderTextAlign,
    updateReaderPadding,
})(ChapterBottomSheet);

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    readerSettingsContainer: { flex: 1, alignItems: "center", paddingTop: 30 },
});
