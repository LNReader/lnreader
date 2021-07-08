import { StatusBar } from "react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export const setStatusBarStyle = (theme) => {
    changeNavigationBarColor(theme.colorPrimary);
    StatusBar.setBarStyle(
        theme.statusBar === "light" ? "light-content" : "dark-content"
    );
};
