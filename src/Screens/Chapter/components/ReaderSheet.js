import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { ToggleButton, IconButton, Chip } from "react-native-paper";
import Slider from "@react-native-community/slider";
import Bottomsheet from "rn-sliding-up-panel";
import { fonts } from "../../../Services/utils/constants";

import { setReaderSettings } from "../../../redux/settings/settings.actions";
import BottomSheetHandle from "../../../Components/BottomSheetHandle";

const ReaderSheet = ({ theme, reader, dispatch, bottomSheetRef }) => {
    const ReaderSettingTitle = ({ title }) => (
        <Text
            style={{
                color: "#FFFFFF",
                fontWeight: "bold",
            }}
        >
            {title}
        </Text>
    );

    return (
        <Bottomsheet
            ref={bottomSheetRef}
            draggableRange={{ top: 400, bottom: 0 }}
            snappingPoints={[0, 400]}
            showBackdrop={true}
            backdropOpacity={0}
        >
            <View style={styles.contentContainer}>
                <BottomSheetHandle theme={theme} />
                <View style={styles.readerSettingsContainer}>
                    <ReaderSettingTitle title="Text Size" />
                    <Slider
                        style={{
                            width: Dimensions.get("window").width,
                            height: 40,
                        }}
                        value={reader.textSize}
                        minimumValue={12}
                        maximumValue={20}
                        step={2}
                        minimumTrackTintColor={theme.colorAccent}
                        maximumTrackTintColor="#000000"
                        thumbTintColor={theme.colorAccent}
                        onValueChange={(value) =>
                            dispatch(setReaderSettings("textSize", value))
                        }
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                        }}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ReaderSettingTitle title="Reader Theme" />
                            <ToggleButton.Row
                                onValueChange={(value) => {
                                    dispatch(
                                        setReaderSettings(
                                            "theme",
                                            value ?? reader.theme
                                        )
                                    );
                                }}
                                value={reader.theme}
                                style={{ marginTop: 10 }}
                            >
                                <ToggleButton
                                    icon={reader.theme === 1 && "check"}
                                    color="#FFFFFF"
                                    value={1}
                                    style={{
                                        backgroundColor: "#000000",
                                        marginHorizontal: 10,
                                        borderRadius: 50,
                                        borderTopRightRadius: 50,
                                        borderBottomRightRadius: 50,
                                    }}
                                />
                                <ToggleButton
                                    icon={reader.theme === 2 && "check"}
                                    color="#000000"
                                    value={2}
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        marginHorizontal: 10,
                                        borderRadius: 50,
                                    }}
                                />
                                <ToggleButton
                                    icon={reader.theme === 3 && "check"}
                                    color="#000000"
                                    value={3}
                                    style={{
                                        backgroundColor: "#F4ECD8",
                                        marginHorizontal: 10,
                                        borderRadius: 50,
                                        borderTopLeftRadius: 50,
                                        borderBottomLeftRadius: 50,
                                    }}
                                />
                            </ToggleButton.Row>
                        </View>
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ReaderSettingTitle title="Text Align" />
                            <ToggleButton.Row
                                onValueChange={(value) =>
                                    dispatch(
                                        setReaderSettings(
                                            "textAlign",
                                            value ?? reader.textAlign
                                        )
                                    )
                                }
                                value={reader.textAlign}
                                style={{ marginTop: 10 }}
                            >
                                <ToggleButton
                                    icon="format-align-left"
                                    color={
                                        reader.textAlign === "left"
                                            ? theme.colorAccent
                                            : "#000000"
                                    }
                                    value="left"
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        marginHorizontal: 10,
                                        borderWidth: 0,
                                        borderTopRightRadius: 4,
                                        borderBottomRightRadius: 4,
                                    }}
                                />
                                <ToggleButton
                                    icon="format-align-justify"
                                    color={
                                        reader.textAlign === "justify"
                                            ? theme.colorAccent
                                            : "#000000"
                                    }
                                    value="justify"
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        marginHorizontal: 10,
                                        borderWidth: 0,
                                        borderRadius: 4,
                                    }}
                                />
                                <ToggleButton
                                    icon="format-align-right"
                                    color={
                                        reader.textAlign === "right"
                                            ? theme.colorAccent
                                            : "#000000"
                                    }
                                    value="right"
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        marginHorizontal: 10,
                                        borderWidth: 0,
                                        borderTopLeftRadius: 4,
                                        borderBottomLeftRadius: 4,
                                    }}
                                />
                            </ToggleButton.Row>
                        </View>
                    </View>
                    <Text
                        style={{
                            color: "#FFFFFF",
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
                            color={theme.colorAccent}
                            size={26}
                            disabled={reader.padding <= 0 ? true : false}
                            onPress={() =>
                                dispatch(
                                    setReaderSettings(
                                        "padding",
                                        reader.padding - 1
                                    )
                                )
                            }
                        />
                        <Text
                            style={{
                                color: "#FFFFFF",
                                paddingHorizontal: 50,
                            }}
                        >
                            {`${reader.padding}%`}
                        </Text>
                        <IconButton
                            icon="plus"
                            color={theme.colorAccent}
                            size={26}
                            disabled={reader.padding >= 10 ? true : false}
                            onPress={() =>
                                dispatch(
                                    setReaderSettings(
                                        "padding",
                                        reader.padding + 1
                                    )
                                )
                            }
                        />
                    </View>
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontWeight: "bold",
                            marginVertical: 10,
                        }}
                    >
                        Font Style
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {fonts.map((font, index) => (
                            <Chip
                                key={index}
                                onPress={() =>
                                    dispatch(
                                        setReaderSettings(
                                            "fontFamily",
                                            font.fontFamily
                                        )
                                    )
                                }
                                textStyle={{ fontFamily: font.fontFamily }}
                                style={{
                                    borderWidth: 0,
                                    marginHorizontal: 5,
                                    marginVertical: 5,
                                }}
                                selected={
                                    reader.fontFamily === font.fontFamily
                                        ? true
                                        : false
                                }
                            >
                                {font.name}
                            </Chip>
                        ))}
                    </View>
                </View>
            </View>
        </Bottomsheet>
    );
};

export default ReaderSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    readerSettingsContainer: { flex: 1, alignItems: "center", paddingTop: 30 },
});
