import React from "react";

import { Animated, StyleSheet, View, Text, Dimensions } from "react-native";
import { ToggleButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import Bottomsheet from "rn-sliding-up-panel";

import { connect } from "react-redux";

import {
    updateReaderTextSize,
    updateReaderTheme,
} from "../../../redux/settings/settings.actions";
import BottomSheetHandle from "../../../components/common/BottomSheetHandle";

const ChapterBottomSheet = ({
    bottomSheetRef,
    theme,
    reader,
    updateReaderTextSize,
    updateReaderTheme,
}) => {
    return (
        <Bottomsheet
            animatedValue={new Animated.Value(0)}
            ref={bottomSheetRef}
            draggableRange={{ top: 200, bottom: 0 }}
            snappingPoints={[0, 200]}
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
                        step={4}
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
