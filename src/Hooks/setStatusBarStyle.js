import { setStatusBarStyle as setExpoStatusBarStyle } from "expo-status-bar";
import { useTheme } from "../Hooks/useTheme";

export const setStatusBarStyle = () => {
    const theme = useTheme();
    setExpoStatusBarStyle(theme.id === 1 ? "dark" : "light");
};
