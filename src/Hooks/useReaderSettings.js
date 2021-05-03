import { useSelector } from "react-redux";

export const useReaderSettings = () => {
    const readerSettings = useSelector((state) => state.settingsReducer.reader);

    return readerSettings;
};
