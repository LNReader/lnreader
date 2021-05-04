import { useSelector } from "react-redux";

const useTheme = () => {
    const theme = useSelector((state) => state.settingsReducer.theme);

    return theme;
};

const useReaderSettings = () => {
    const readerSettings = useSelector((state) => state.settingsReducer.reader);

    return readerSettings;
};

const useSettings = () => {
    const { displayMode, itemsPerRow } = useSelector(
        (state) => state.settingsReducer
    );

    return { displayMode, itemsPerRow };
};

const useLibrary = () => {
    const library = useSelector((state) => state.libraryReducer.novels);

    return library;
};

export { useTheme, useReaderSettings, useLibrary, useSettings };
