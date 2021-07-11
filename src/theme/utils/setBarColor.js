import { StatusBar } from "react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";

/**
 * Sets status and navigation bar color.
 *
 * @param theme
 */

export const setBarColor = (theme) => {
    changeNavigationBarColor(theme.colorPrimary);

    StatusBar.setBarStyle(theme.statusBar);
};
