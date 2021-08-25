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
    setAppTheme,
    setRippleColor,
} from "../../redux/settings/settings.actions";
import ColorPickerModal from "../../components/ColorPickerModal";
import SwitchSetting from "../../components/Switch/Switch";
import { ScrollView, Text, View } from "react-native";
import { SHOW_LAST_UPDATE_TIME } from "../../redux/updates/updates.types";
import { ThemePicker } from "../../components/ThemePicker/ThemePicker";
import {
    darkTheme,
    greenAppleTheme,
    irisBlueTheme,
    lightTheme,
    midnightDuskTheme,
    oceanicTheme,
    springBlossomTheme,
    strawberryDaiquiri,
    takoTheme,
    yangTheme,
    yinYangTheme,
    yotsubaTheme,
} from "../../theme/theme";

const GenralSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const { displayMode, novelsPerRow } = useSelector(
        (state) => state.settingsReducer
    );

    const {
        updateLibraryOnLaunch = false,
        downloadNewChapters = false,
        showHistoryTab = true,
        showUpdatesTab = true,
        showLabelsInNav = false,
    } = useSettings();

    const { showLastUpdateTime = true } = useSelector(
        (state) => state.updatesReducer
    );

    const displayModeLabel = (displayMode) => {
        const label = {
            0: "Compact Grid",
            1: "Comfortable Grid",
            2: "List",
            3: "No Title Grid",
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
    // const [themeModalVisible, setthemeModalVisible] = useState(false);
    // const showthemeModal = () => setthemeModalVisible(true);
    // const hidethemeModal = () => setthemeModalVisible(false);

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
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                <List.Section>
                    <SwitchSetting
                        label="Show updates in the nav"
                        value={showUpdatesTab}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "showUpdatesTab",
                                    !showUpdatesTab
                                )
                            )
                        }
                        theme={theme}
                    />
                    <SwitchSetting
                        label="Show history in the nav"
                        value={showHistoryTab}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "showHistoryTab",
                                    !showHistoryTab
                                )
                            )
                        }
                        theme={theme}
                    />
                    <SwitchSetting
                        label="Always show nav labels"
                        value={showLabelsInNav}
                        onPress={() =>
                            dispatch(
                                setAppSettings(
                                    "showLabelsInNav",
                                    !showLabelsInNav
                                )
                            )
                        }
                        theme={theme}
                    />
                    <List.Divider theme={theme} />
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
                    <SwitchSetting
                        label="Show last update time"
                        value={showLastUpdateTime}
                        onPress={() =>
                            dispatch({
                                type: SHOW_LAST_UPDATE_TIME,
                                payload: !showLastUpdateTime,
                            })
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
                    <List.SubHeader theme={theme}>App theme</List.SubHeader>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        Light Theme
                    </Text>
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            flexDirection: "row",
                        }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        <ThemePicker
                            currentTheme={theme}
                            theme={lightTheme}
                            onPress={() => dispatch(setAppTheme(lightTheme.id))}
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={springBlossomTheme}
                            onPress={() =>
                                dispatch(setAppTheme(springBlossomTheme.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={yangTheme}
                            onPress={() => dispatch(setAppTheme(yangTheme.id))}
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={yotsubaTheme}
                            onPress={() =>
                                dispatch(setAppTheme(yotsubaTheme.id))
                            }
                        />
                    </ScrollView>
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        Dark Theme
                    </Text>
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingTop: 4,
                            paddingBottom: 8,
                            flexDirection: "row",
                        }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        <ThemePicker
                            currentTheme={theme}
                            theme={darkTheme}
                            onPress={() => dispatch(setAppTheme(darkTheme.id))}
                        />

                        <ThemePicker
                            currentTheme={theme}
                            theme={midnightDuskTheme}
                            onPress={() =>
                                dispatch(setAppTheme(midnightDuskTheme.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={strawberryDaiquiri}
                            onPress={() =>
                                dispatch(setAppTheme(strawberryDaiquiri.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={takoTheme}
                            onPress={() => dispatch(setAppTheme(takoTheme.id))}
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={greenAppleTheme}
                            onPress={() =>
                                dispatch(setAppTheme(greenAppleTheme.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={yinYangTheme}
                            onPress={() =>
                                dispatch(setAppTheme(yinYangTheme.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={irisBlueTheme}
                            onPress={() =>
                                dispatch(setAppTheme(irisBlueTheme.id))
                            }
                        />
                        <ThemePicker
                            currentTheme={theme}
                            theme={oceanicTheme}
                            onPress={() =>
                                dispatch(setAppTheme(oceanicTheme.id))
                            }
                        />
                    </ScrollView>
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
                    <List.ColorItem
                        title="Accent Color"
                        description={theme.colorAccent.toUpperCase()}
                        onPress={showAccentColorModal}
                        theme={theme}
                    />
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
            {/* <ThemeModal
                dispatch={dispatch}
                themeModalVisible={themeModalVisible}
                hidethemeModal={hidethemeModal}
                theme={theme}
            /> */}
            <ColorPickerModal
                title="Accent color"
                modalVisible={accentColorModal}
                hideModal={hideAccentColorModal}
                color={theme.colorAccent}
                onSubmit={onSubmit}
                theme={theme}
                showAccentColors={true}
            />
        </ScreenContainer>
    );
};

export default GenralSettings;
