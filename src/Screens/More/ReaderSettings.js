import React, { useState } from "react";
import { Text, View } from "react-native";
import { useDispatch } from "react-redux";

import { Appbar } from "../../Components/Appbar";
import ColorPickerModal from "../../Components/ColorPickerModal";
import { ScreenContainer } from "../../Components/Common";
import { ListItem, ListSection, ListSubHeader } from "../../Components/List";

import { useReaderSettings, useTheme } from "../../Hooks/reduxHooks";
import { setReaderSettings } from "../../redux/settings/settings.actions";
import {
    readerBackground,
    readerLineHeight,
    readerTextColor,
} from "../Chapter/readerStyleController";
import AccentColorModal from "./components/AccentColorModal";

const ReaderSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const reader = useReaderSettings();

    const textColor = {
        1: "rgba(255,255,255,0.7)",
        2: "#000000",
        3: "#000000",
        4: "#FFFFFF",
    };

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

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Reader" onBackAction={() => navigation.goBack()} />
            <View style={{ backgroundColor: readerBackground(reader.theme) }}>
                <Text style={readerStyles}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                    lobortis nunc id nisl tempor, sed tristique sem sagittis.
                    Mauris consequat orci egestas volutpat vestibulum. Nullam
                    convallis, leo in porttitor fringilla, ex mi finibus felis,
                    non molestie ligula ligula facilisis ligula. Nam eu est a
                    turpis porttitor aliquet sed vel risus. Ut ac scelerisque
                    diam. Nulla fringilla enim non ex rhoncus faucibus. Integer
                    eget lacus justo. Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Ut vitae tempor metus. Morbi nec nisl
                    cursus, gravida ex vitae, laoreet leo. Pellentesque in
                    lectus ante. Aliquam porta suscipit pretium. Sed ut ligula
                    at dolor pretium egestas quis vitae urna. In ullamcorper
                    venenatis orci, eu pulvinar nibh venenatis sit amet.
                </Text>
            </View>
            <ListSection>
                <ListSubHeader theme={theme}>Reader</ListSubHeader>
                <ListItem
                    title="Background Color"
                    description={readerBackground(reader.theme).toUpperCase()}
                    onPress={showReaderBackgroundtColorModal}
                    theme={theme}
                    iconColor={readerBackground(reader.theme)}
                    right="circle"
                />
                <ListItem
                    title="Text Color"
                    description={reader.textColor.toUpperCase()}
                    onPress={showReaderTextColorModal}
                    theme={theme}
                    iconColor={reader.textColor}
                    right="circle"
                />
            </ListSection>
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
