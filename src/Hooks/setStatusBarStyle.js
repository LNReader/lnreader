import { setStatusBarStyle as setExpoStatusBarStyle } from "expo-status-bar";
import { useTheme } from "../Hooks/reduxHooks";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export const setStatusBarStyle = () => {
    const theme = useTheme();

    setExpoStatusBarStyle(theme.id === 1 ? "dark" : "light");
    changeNavigationBarColor(theme.colorPrimary);
};
