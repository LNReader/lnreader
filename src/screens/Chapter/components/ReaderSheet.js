import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Pressable,
    ScrollView,
} from "react-native";

import Slider from "@react-native-community/slider";
import { IconButton, Menu, Switch } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";

import BottomSheetHandle from "../../../components/BottomSheetHandle";
import { Row } from "../../../components/Common";

import { fonts } from "../../../services/utils/constants";

import {
    setAppSettings,
    setReaderSettings,
} from "../../../redux/settings/settings.actions";
import {
    ToggleButton,
    ToggleColorButton,
} from "../../../components/Common/ToggleButton";

const ReaderSheet = ({
    theme,
    reader,
    dispatch,
    navigation,
    bottomSheetRef,
    selectText,
    useWebViewForChapter,
    showScrollPercentage,
}) => {
    const [fontMenu, setFontMenu] = useState(false);
    const openFontMenu = () => setFontMenu(true);
    const closeFontMenu = () => setFontMenu(false);

    const ReaderSettingTitle = ({ title }) => (
        <Text style={styles.title}>{title}</Text>
    );

    const presetThemes = [
        { value: 2, backgroundColor: "#f5f5fa", textColor: "#111111" },
        { value: 3, backgroundColor: "#F7DFC6", textColor: "#593100" },
        { value: 6, backgroundColor: "#dce5e2", textColor: "#000000" },
        { value: 4, backgroundColor: "#292832", textColor: "#CCCCCC" },
        {
            value: 1,
            backgroundColor: "#000000",
            textColor: "rgba(255,255,255,0.7)",
        },
    ];

    const textAlignments = [
        { value: "left", icon: "format-align-left" },
        { value: "center", icon: "format-align-center" },
        { value: "justify", icon: "format-align-justify" },
        { value: "right", icon: "format-align-right" },
    ];

    return (
        <Bottomsheet
            ref={bottomSheetRef}
            draggableRange={{ top: 520, bottom: 0 }}
            snappingPoints={[0, 520]}
            showBackdrop={true}
            backdropOpacity={0}
        >
            <View style={styles.contentContainer}>
                <BottomSheetHandle theme={theme} />
                {/* <IconButton
                    icon="cog-outline"
                    color={"#FFFFFF"}
                    size={24}
                    onPress={() => {
                        navigation.navigate("MoreStack", {
                            screen: "SettingsStack",
                            params: {
                                screen: "ReaderSettings",
                            },
                        });
                        bottomSheetRef.current.hide();
                    }}
                    style={{
                        marginVertical: 0,
                        position: "absolute",
                        top: 16,
                        right: 16,
                    }}
                /> */}
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
                        step={1}
                        minimumTrackTintColor={theme.colorAccent}
                        maximumTrackTintColor="#000000"
                        thumbTintColor={theme.colorAccent}
                        onSlidingComplete={(value) =>
                            dispatch(setReaderSettings("textSize", value))
                        }
                    />
                    <Row
                        style={{
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        <ReaderSettingTitle title="Color" />
                        <View style={{ marginLeft: 16 }}>
                            <ScrollView horizontal={true}>
                                {presetThemes.map((item, index) => (
                                    <ToggleColorButton
                                        key={index}
                                        selected={reader.theme === item.value}
                                        backgroundColor={item.backgroundColor}
                                        textColor={item.textColor}
                                        theme={theme}
                                        onPress={() => {
                                            dispatch(
                                                setReaderSettings(
                                                    "theme",
                                                    item.value
                                                )
                                            );
                                            dispatch(
                                                setReaderSettings(
                                                    "textColor",
                                                    item.textColor
                                                )
                                            );
                                        }}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </Row>
                    <Row
                        style={{
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        <ReaderSettingTitle title="Text Align" />
                        <Row>
                            {textAlignments.map((item) => (
                                <ToggleButton
                                    key={item.value}
                                    selected={item.value === reader.textAlign}
                                    icon={item.icon}
                                    color="#FFFFFF"
                                    theme={theme}
                                    onPress={() =>
                                        dispatch(
                                            setReaderSettings(
                                                "textAlign",
                                                item.value
                                            )
                                        )
                                    }
                                />
                            ))}
                        </Row>
                    </Row>
                    <Row
                        style={{
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        <ReaderSettingTitle title="Padding" />
                        <Row>
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
                                style={{ marginVertical: 0 }}
                            />
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    paddingHorizontal: 24,
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
                                style={{ marginVertical: 0 }}
                            />
                        </Row>
                    </Row>
                    <Row
                        style={{
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        <ReaderSettingTitle title="Line Height" />
                        <Row>
                            <IconButton
                                icon="minus"
                                color={theme.colorAccent}
                                size={26}
                                disabled={
                                    reader.lineHeight <= 1.3 ? true : false
                                }
                                onPress={() =>
                                    dispatch(
                                        setReaderSettings(
                                            "lineHeight",
                                            reader.lineHeight - 0.1
                                        )
                                    )
                                }
                                style={{ marginVertical: 0 }}
                            />
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    paddingHorizontal: 24,
                                }}
                            >
                                {`${Math.round(reader.lineHeight * 10) / 10}%`}
                            </Text>
                            <IconButton
                                icon="plus"
                                color={theme.colorAccent}
                                size={26}
                                disabled={reader.lineHeight >= 2 ? true : false}
                                onPress={() =>
                                    dispatch(
                                        setReaderSettings(
                                            "lineHeight",
                                            reader.lineHeight + 0.1
                                        )
                                    )
                                }
                                style={{ marginVertical: 0 }}
                            />
                        </Row>
                    </Row>
                    <Pressable
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                        android_ripple={{ color: theme.colorAccent }}
                        onPress={openFontMenu}
                    >
                        <ReaderSettingTitle title="Font Style" />
                        <Menu
                            visible={fontMenu}
                            onDismiss={closeFontMenu}
                            contentStyle={{ backgroundColor: theme.menuColor }}
                            anchor={
                                <Text
                                    style={{
                                        color: "white",
                                        fontSize: 16,
                                        fontFamily: reader.fontFamily,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    {fonts.find(
                                        (font) =>
                                            font.fontFamily ===
                                            reader.fontFamily
                                    ).name || "Default"}
                                </Text>
                            }
                        >
                            {fonts.map((font) => (
                                <Menu.Item
                                    key={font.fontFamily}
                                    onPress={() =>
                                        dispatch(
                                            setReaderSettings(
                                                "fontFamily",
                                                font.fontFamily
                                            )
                                        )
                                    }
                                    icon={
                                        font.fontFamily === reader.fontFamily &&
                                        "check"
                                    }
                                    title={font.name}
                                    style={{ backgroundColor: theme.menuColor }}
                                    titleStyle={{
                                        color: theme.textColorPrimary,
                                        fontFamily: font.fontFamily,
                                    }}
                                />
                            ))}
                        </Menu>
                    </Pressable>
                    <Pressable
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                        android_ripple={{ color: theme.colorAccent }}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "useWebViewForChapter",
                                    !useWebViewForChapter
                                )
                            )
                        }
                    >
                        <ReaderSettingTitle title="Use WebView" />
                        <Switch
                            value={useWebViewForChapter}
                            onValueChange={() =>
                                dispatch(
                                    setAppSettings(
                                        "useWebViewForChapter",
                                        !useWebViewForChapter
                                    )
                                )
                            }
                            color={theme.colorAccent}
                        />
                    </Pressable>
                    <Pressable
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                        android_ripple={{ color: theme.colorAccent }}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "showScrollPercentage",
                                    !showScrollPercentage
                                )
                            )
                        }
                    >
                        <ReaderSettingTitle title="Show Progress Percentage" />
                        <Switch
                            value={showScrollPercentage}
                            onValueChange={() =>
                                dispatch(
                                    setAppSettings(
                                        "showScrollPercentage",
                                        !showScrollPercentage
                                    )
                                )
                            }
                            color={theme.colorAccent}
                        />
                    </Pressable>
                    <Pressable
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                        android_ripple={{ color: theme.colorAccent }}
                        onPress={() =>
                            dispatch(
                                setAppSettings("textSelectable", !selectText)
                            )
                        }
                    >
                        <View>
                            <ReaderSettingTitle title="Select Text " />
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "white",
                                }}
                            >
                                (Justify does not work with selectable text)
                            </Text>
                        </View>
                        <Switch
                            value={selectText}
                            onValueChange={() =>
                                dispatch(
                                    setAppSettings(
                                        "textSelectable",
                                        !selectText
                                    )
                                )
                            }
                            color={theme.colorAccent}
                        />
                    </Pressable>
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
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    readerSettingsContainer: {
        flex: 1,
        alignItems: "center",
        paddingTop: 30,
    },
    title: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
});
