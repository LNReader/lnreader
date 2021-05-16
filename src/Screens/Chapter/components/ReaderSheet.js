import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { ToggleButton, IconButton, Chip } from "react-native-paper";
import Slider from "@react-native-community/slider";
import Bottomsheet from "rn-sliding-up-panel";
import { fonts } from "../../../Services/utils/constants";

import { setReaderSettings } from "../../../redux/settings/settings.actions";
import BottomSheetHandle from "../../../Components/BottomSheetHandle";

const ReaderSheet = ({ theme, reader, dispatch, bottomSheetRef }) => {
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
                    <Text
                        style={{
                            color: "#FFFFFF",
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
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                }}
                            >
                                Reader Theme
                            </Text>
                            <ToggleButton.Row
                                onValueChange={(value) =>
                                    dispatch(setReaderSettings("theme", value))
                                }
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
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                }}
                            >
                                Text Align
                            </Text>
                            <ToggleButton.Row
                                onValueChange={(value) =>
                                    dispatch(
                                        setReaderSettings(
                                            "textAlign",
                                            value || "left"
                                        )
                                    )
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
                            marginTop: 10,
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
