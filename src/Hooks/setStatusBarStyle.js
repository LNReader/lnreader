import { setStatusBarStyle as setExpoStatusBarStyle } from "expo-status-bar";
import { useTheme } from "../Hooks/reduxHooks";

export const setStatusBarStyle = () => {
    const theme = useTheme();
    setExpoStatusBarStyle(theme.id === 1 ? "dark" : "light");
};
