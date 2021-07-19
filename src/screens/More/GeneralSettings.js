import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { List } from "../../components/List";
import { ScreenContainer } from "../../components/Common";

import { useSettings, useTheme } from "../../hooks/reduxHooks";
import DisplayModeModal from "./components/DisplayModeModal";
import GridSizeModal from "./components/GridSizeModal";
import ThemeModal from "./components/ThemeModal";
import {
    setAccentColor,
    setAmoledMode,
    setAppSettings,
    setRippleColor,
} from "../../redux/settings/settings.actions";
import ColorPickerModal from "../../components/ColorPickerModal";
import SwitchSetting from "../../components/Switch/Switch";
import { ScrollView } from "react-native";

const GenralSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const { displayMode, novelsPerRow } = useSelector(
        (state) => state.settingsReducer
    );

    const { updateLibraryOnLaunch = false, downloadNewChapters = false } =
        useSettings();

    const displayModeLabel = (displayMode) => {
        const label = {
            0: "Compact Grid",
            1: "Comfortable Grid",
            2: "List",
        };

        return label[displayMode] ?? "Compact Grid";
    };

    /**
     * Display Mode Modal
     */
    const [displayModalVisible, setDisplayModalVisible] = useState(false);
    const showDisplayModal = () => setDisplayModalVisible(true);
    const hideDisplayModal = () => setDisplayModalVisible(false);

    /**
     * Theme Modal
     */
    const [themeModalVisible, setthemeModalVisible] = useState(false);
    const showthemeModal = () => setthemeModalVisible(true);
    const hidethemeModal = () => setthemeModalVisible(false);

    /**
     * Grid Size Modal
     */
    const [gridSizeModalVisible, setGridSizeModalVisible] = useState(false);
    const showGridSizeModal = () => setGridSizeModalVisible(true);
    const hideGridSizeModal = () => setGridSizeModalVisible(false);

    /**
     * Accent Color Modal
     */
    const [accentColorModal, setAccentColorModal] = useState(false);
    const showAccentColorModal = () => setAccentColorModal(true);
    const hideAccentColorModal = () => setAccentColorModal(false);

    const hexToRgb = (hex) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    };

    const onSubmit = (val) => {
        dispatch(setAccentColor(val));
        const rgb = hexToRgb(val);
        const rgbaColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`;
        dispatch(setRippleColor(rgbaColor));
    };

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="General" onBackAction={navigation.goBack} />
            <ScrollView>
                <List.Section>
                    <List.SubHeader theme={theme}>Display</List.SubHeader>
                    <List.Item
                        title="Display Mode"
                        description={displayModeLabel(displayMode)}
                        onPress={showDisplayModal}
                        theme={theme}
                    />
                    <List.Item
                        title="Items per row in library"
                        description={`${novelsPerRow} items per row`}
                        onPress={showGridSizeModal}
                        theme={theme}
                    />
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>Library</List.SubHeader>
                    <SwitchSetting
                        label="Update library on launch"
                        value={updateLibraryOnLaunch}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "updateLibraryOnLaunch",
                                    !updateLibraryOnLaunch
                                )
                            )
                        }
                        theme={theme}
                    />
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>Auto-download</List.SubHeader>
                    <SwitchSetting
                        label="Download new chapters"
                        value={downloadNewChapters}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "downloadNewChapters",
                                    !downloadNewChapters
                                )
                            )
                        }
                        theme={theme}
                    />
                    <List.Divider theme={theme} />

                    <List.SubHeader theme={theme}>Theme</List.SubHeader>
                    <List.Item
                        title="Theme"
                        description={theme.name}
                        onPress={showthemeModal}
                        theme={theme}
                    />
                    <List.Item
                        title="Accent Color"
                        description={theme.colorAccent.toUpperCase()}
                        onPress={showAccentColorModal}
                        theme={theme}
                        iconColor={theme.colorAccent}
                        right="circle"
                    />
                    {theme.statusBar === "light-content" && (
                        <SwitchSetting
                            label="Pure black dark mode"
                            value={
                                theme.colorPrimary === "#000000" &&
                                theme.colorPrimaryDark === "#000000"
                            }
                            onPress={() =>
                                dispatch(
                                    setAmoledMode(
                                        theme.id,
                                        !(
                                            theme.colorPrimary === "#000000" &&
                                            theme.colorPrimaryDark === "#000000"
                                        )
                                    )
                                )
                            }
                            theme={theme}
                        />
                    )}
                </List.Section>
            </ScrollView>
            <DisplayModeModal
                displayMode={displayMode}
                displayModalVisible={displayModalVisible}
                hideDisplayModal={hideDisplayModal}
                dispatch={dispatch}
                theme={theme}
            />
            <GridSizeModal
                dispatch={dispatch}
                novelsPerRow={novelsPerRow}
                gridSizeModalVisible={gridSizeModalVisible}
                hideGridSizeModal={hideGridSizeModal}
                theme={theme}
            />
            <ThemeModal
                dispatch={dispatch}
                themeModalVisible={themeModalVisible}
                hidethemeModal={hidethemeModal}
                theme={theme}
            />
            <ColorPickerModal
                title="Accent color"
                modalVisible={accentColorModal}
                hideModal={hideAccentColorModal}
                color={theme.colorAccent}
                onSubmit={onSubmit}
                theme={theme}
            />
        </ScreenContainer>
    );
};

export default GenralSettings;
