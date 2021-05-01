import { useSelector } from "react-redux";

export const useTheme = () => {
    const currentTheme = useSelector((state) => state.themeReducer.theme);

    return currentTheme;
};
