import { useEffect } from "react";
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

const findNovel = (novelId) => {
    let novel = useSelector((state) => state.preferenceReducer.novelSettings);
    novel = novel.find((novel) => novel.novelId === novelId);

    return novel;
};

const usePreferences = (novelId) => {
    let sort, filter;

    const novel = findNovel(novelId);

    if (novel) {
        sort = novel.sort ?? "";
        filter = novel.filter ?? "";
    }

    return { sort, filter };
};

const useContinueReading = (chapters, novelId) => {
    let chapter, chapterId, novel;

    novel = findNovel(novelId);

    if (novel) {
        chapterId = novel.lastRead;
    }

    if (chapterId) {
        chapter = chapters.find((obj) => obj.chapterId === chapterId);
    }

    if (!chapter) {
        chapter = chapters.find((obj) => obj.read === 0);
    }

    return chapter;
};

export {
    useTheme,
    useReaderSettings,
    useLibrary,
    useSettings,
    usePreferences,
    useContinueReading,
    findNovel,
};
