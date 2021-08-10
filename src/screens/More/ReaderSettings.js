import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import WebView from "react-native-webview";
import { useDispatch } from "react-redux";

import { Appbar } from "../../components/Appbar";
import ColorPickerModal from "../../components/ColorPickerModal";
import { Row, ScreenContainer } from "../../components/Common";
import {
    ToggleButton,
    ToggleColorButton,
} from "../../components/Common/ToggleButton";
import { List } from "../../components/List";

import { useReaderSettings, useTheme } from "../../hooks/reduxHooks";
import { setReaderSettings } from "../../redux/settings/settings.actions";
import {
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "../Chapter/readerStyleController";

const ReaderSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const reader = useReaderSettings();

    /**
     * Reader Background Color Modal
     */
    const [readerBackgroundColorModal, setReaderBackgroundtColorModal] =
        useState(false);
    const showReaderBackgroundtColorModal = () =>
        setReaderBackgroundtColorModal(true);
    const hideReaderBackgroundtColorModal = () =>
        setReaderBackgroundtColorModal(false);

    /**
     * Reader Text Color Modal
     */
    const [readerTextColorModal, setReaderTextColorModal] = useState(false);
    const showReaderTextColorModal = () => setReaderTextColorModal(true);
    const hideReaderTextColorModal = () => setReaderTextColorModal(false);

    const setReaderBackground = (val) => {
        dispatch(setReaderSettings("theme", val));
    };

    const setReaderTextColor = (val) => {
        dispatch(setReaderSettings("textColor", val ?? reader.textColor));
    };

    const readerStyles = [
        {
            paddingVertical: 16,
            paddingBottom: 32,
            fontSize: reader.textSize,
            color: reader.textColor,
            lineHeight: readerLineHeight(reader.textSize, reader.lineHeight),
            textAlign: reader.textAlign,
            paddingHorizontal: `${reader.padding}%`,
        },
        reader.fontFamily && {
            fontFamily: reader.fontFamily,
        },
    ];

    const presetThemes = [
        {
            value: 1,
            backgroundColor: "#000000",
            textColor: "rgba(255,255,255,0.7)",
        },
        { value: 2, backgroundColor: "#FFFFFF", textColor: "#111111" },
        { value: 3, backgroundColor: "#F7DFC6", textColor: "#593100" },
        { value: 4, backgroundColor: "#292832", textColor: "#CCCCCC" },
        { value: 5, backgroundColor: "#2B2C30", textColor: "#CCCCCC" },
    ];

    const textAlignments = [
        { value: "left", icon: "format-align-left" },
        { value: "center", icon: "format-align-center" },
        { value: "justify", icon: "format-align-justify" },
        { value: "right", icon: "format-align-right" },
    ];

    const [customHtmlCSS, setcustomHtmlCSS] = useState(reader.customCSS);

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Reader" onBackAction={navigation.goBack} />
            <View style={{ height: 360 }}>
                <WebView
                    originWhitelist={["*"]}
                    style={{
                        backgroundColor: readerBackground(reader.theme),
                    }}
                    source={{
                        html: `
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                            <style>
                                @font-face {
                                    font-family: ${reader.fontFamily};
                                    src: url("file:///android_asset/fonts/${reader.fontFamily}.ttf");
                                }
                                body {
                                    padding-top: 8px;
                                    padding-bottom: 8px;
                                    padding-left: ${reader.padding}%;
                                    padding-right: ${reader.padding}%;
                                    font-family: ${reader.fontFamily};
                                    text-align: ${reader.textAlign};
                                    line-height: ${reader.lineHeight};
                                    font-size: ${reader.textSize}px;
                                    color: ${reader.textColor};
                                }
                                ${reader.customCSS}
                            </style>
                        </head>
                        <body>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Ut lobortis nunc id nisl tempor, sed tristique sem
                                sagittis. Mauris consequat orci egestas volutpat
                                vestibulum. Nullam convallis, leo in porttitor
                                fringilla, ex mi finibus felis, non molestie ligula
                                ligula facilisis ligula. Nam eu est a turpis porttitor
                                aliquet sed vel risus. Ut ac scelerisque diam. Nulla
                                fringilla enim non ex rhoncus faucibus. Integer eget
                                lacus justo.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Ut lobortis nunc id nisl tempor, sed tristique sem
                                sagittis. Mauris consequat orci egestas volutpat
                                vestibulum. Nullam convallis, leo in porttitor
                                fringilla, ex mi finibus felis, non molestie ligula
                                ligula facilisis ligula.
                        </body>
                    </html>
                    `,
                    }}
                />
            </View>
            <ScrollView>
                <List.Section>
                    <List.SubHeader theme={theme}>Preset</List.SubHeader>
                    <View style={styles.pressableListItem}>
                        <Text
                            style={{
                                color: theme.textColorPrimary,
                                fontSize: 16,
                            }}
                        >
                            Preset Themes
                        </Text>
                        <ScrollView
                            style={{ marginLeft: 16 }}
                            horizontal={true}
                        >
                            <Row>
                                {presetThemes.map((theme) => (
                                    <ToggleColorButton
                                        key={theme.value}
                                        selected={
                                            reader.theme ===
                                            theme.backgroundColor
                                        }
                                        backgroundColor={theme.backgroundColor}
                                        textColor={theme.textColor}
                                        onPress={() => {
                                            dispatch(
                                                setReaderSettings(
                                                    "theme",
                                                    theme.backgroundColor
                                                )
                                            );
                                            dispatch(
                                                setReaderSettings(
                                                    "textColor",
                                                    theme.textColor
                                                )
                                            );
                                        }}
                                    />
                                ))}
                            </Row>
                        </ScrollView>
                    </View>
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>Reader</List.SubHeader>
                    <List.ColorItem
                        title="Background Color"
                        description={readerBackground(
                            reader.theme
                        ).toUpperCase()}
                        onPress={showReaderBackgroundtColorModal}
                        theme={theme}
                    />
                    <List.ColorItem
                        title="Text Color"
                        description={
                            reader.textColor.toUpperCase() ||
                            readerTextColor(reader.theme)
                        }
                        onPress={showReaderTextColorModal}
                        theme={theme}
                    />
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>Text</List.SubHeader>
                    <Pressable
                        android_ripple={{ color: theme.rippleColor }}
                        style={styles.pressableListItem}
                    >
                        <View>
                            <Text
                                style={{
                                    color: theme.textColorPrimary,
                                    fontSize: 16,
                                }}
                            >
                                Text Align
                            </Text>
                            <Text
                                style={{
                                    color: theme.textColorSecondary,
                                    textTransform: "capitalize",
                                }}
                            >
                                {reader.textAlign}
                            </Text>
                        </View>
                        <Row>
                            {textAlignments.map((item) => (
                                <ToggleButton
                                    key={item.value}
                                    icon={item.icon}
                                    onPress={() => {
                                        dispatch(
                                            setReaderSettings(
                                                "textAlign",
                                                item.value
                                            )
                                        );
                                    }}
                                    selected={item.value === reader.textAlign}
                                    theme={theme}
                                />
                            ))}
                        </Row>
                    </Pressable>
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>
                        Custom CSS (Only works in webview mode)
                    </List.SubHeader>
                    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                        <TextInput
                            style={{
                                color: theme.textColorPrimary,
                                fontSize: 16,
                            }}
                            value={customHtmlCSS}
                            onChangeText={(text) => setcustomHtmlCSS(text)}
                            placeholderTextColor={theme.textColorSecondary}
                            placeholder="Example: body { color: red; }"
                            multiline={true}
                        />
                        <View style={{ flexDirection: "row-reverse" }}>
                            <Button
                                uppercase={false}
                                color={theme.colorAccent}
                                onPress={() =>
                                    dispatch(
                                        setReaderSettings(
                                            "customCSS",
                                            customHtmlCSS
                                        )
                                    )
                                }
                            >
                                Save
                            </Button>
                            <Button
                                uppercase={false}
                                color={theme.colorAccent}
                                onPress={() => {
                                    setcustomHtmlCSS("");
                                    dispatch(
                                        setReaderSettings("customCSS", "")
                                    );
                                }}
                            >
                                Clear
                            </Button>
                        </View>
                    </View>
                </List.Section>
            </ScrollView>

            <ColorPickerModal
                title="Reader background color"
                modalVisible={readerBackgroundColorModal}
                color={readerBackground(reader.theme)}
                hideModal={hideReaderBackgroundtColorModal}
                theme={theme}
                onSubmit={setReaderBackground}
            />
            <ColorPickerModal
                title="Reader text color"
                modalVisible={readerTextColorModal}
                color={reader.textColor}
                hideModal={hideReaderTextColorModal}
                theme={theme}
                onSubmit={setReaderTextColor}
            />
        </ScreenContainer>
    );
};

export default ReaderSettings;

const styles = StyleSheet.create({
    pressableListItem: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    presetToggleButton: {
        marginLeft: 12,
        borderRadius: 50,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        borderWidth: 0,
    },
});
