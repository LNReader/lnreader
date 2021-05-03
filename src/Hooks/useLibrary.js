import { useSelector } from "react-redux";

export const useLibrary = () => {
    const library = useSelector((state) => state.libraryReducer.novels);

    return library;
};
