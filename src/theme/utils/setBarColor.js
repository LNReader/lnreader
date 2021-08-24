import { StatusBar } from "react-native";

/**
 * Sets status and navigation bar color.
 *
 * @param theme
 */

export const setBarColor = (theme) => StatusBar.setBarStyle(theme.statusBar);
