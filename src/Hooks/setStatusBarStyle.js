import { setStatusBarStyle as setExpoStatusBarStyle } from "expo-status-bar";
import { useTheme } from "../Theme/hooks/useTheme";

export const setStatusBarStyle = () => {
    const theme = useTheme();
    setExpoStatusBarStyle(theme.id === 1 ? "dark" : "light");
};
