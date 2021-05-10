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

const useNovel = () => {
    const novel = useSelector((state) => state.novelReducer);

    return novel;
};

const useChapter = () => {
    const chapter = useSelector((state) => state.chapterReducer);

    return chapter;
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
        sort = novel.sort;
        filter = novel.filter;
    }

    return { sort, filter };
};

const useSavedSettings = () => {
    const settings = useSelector(
        (state) => state.preferenceReducer.novelSettings
    );

    return settings;
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

const useTrackingStatus = () => {
    const tracker = useSelector((state) => state.trackerReducer);

    return tracker;
};

export {
    useTheme,
    useReaderSettings,
    useLibrary,
    useSettings,
    usePreferences,
    useContinueReading,
    useTrackingStatus,
    useNovel,
    useChapter,
    useSavedSettings,
};
