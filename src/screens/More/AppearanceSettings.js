import React, { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useDispatch } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { ScreenContainer } from "../../components/Common";
import { List } from "../../components/List";
import { ThemePicker } from "../../components/ThemePicker/ThemePicker";
import SwitchSetting from "../../components/Switch/Switch";
import ColorPickerModal from "../../components/ColorPickerModal";

import { useSettings, useTheme } from "../../hooks/reduxHooks";
import {
    setAccentColor,
    setAmoledMode,
    setAppSettings,
    setAppTheme,
    setRippleColor,
} from "../../redux/settings/settings.actions";

import {
    darkTheme,
    greenAppleTheme,
    irisBlueTheme,
    lightTheme,
    midnightDuskTheme,
    oceanicTheme,
    springBlossomTheme,
    strawberryDaiquiri,
    takoLightTheme,
    takoTheme,
    yangTheme,
    yinYangTheme,
    yotsubaTheme,
} from "../../theme/theme";

const AppearanceSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const {
        showHistoryTab = true,
        showUpdatesTab = true,
        showLabelsInNav = false,
    } = useSettings();

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
            <Appbar title="Appearance" onBackAction={navigation.goBack} />
            <ScrollView style={{ flex: 1 }}>
                <List.Section>
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
                            theme={takoLightTheme}
                            onPress={() =>
                                dispatch(setAppTheme(takoLightTheme.id))
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
                            paddingVertical: 8,
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
                    <List.Divider theme={theme} />
                    <List.SubHeader theme={theme}>Navbar</List.SubHeader>
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
                </List.Section>
            </ScrollView>

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

export default AppearanceSettings;
