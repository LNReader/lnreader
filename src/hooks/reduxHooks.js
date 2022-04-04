import { useSelector } from 'react-redux';
import { darkTheme } from '../theme/v1/theme/theme';

const useTheme = () => {
  const theme = useSelector(state => state.settingsReducer.theme);

  return theme || darkTheme;
};

const useReaderSettings = () => {
  const readerSettings = useSelector(state => state.settingsReducer.reader);

  return readerSettings;
};

const useSettings = () => {
  const settings = useSelector(state => state.settingsReducer);

  return settings;
};

const useLibrary = () => {
  const library = useSelector(state => state.libraryReducer.novels);

  return library;
};

const useNovel = () => {
  const novel = useSelector(state => state.novelReducer);

  return novel;
};

const useChapter = () => {
  const chapter = useSelector(state => state.chapterReducer);

  return chapter;
};

const useFindNovel = novelId => {
  let novel = useSelector(state => state.preferenceReducer.novelSettings);
  novel = novel[novelId];

  return novel;
};

const usePreferences = novelId => {
  let sort, filter, position, showChapterTitles;

  const novel = useFindNovel(novelId);

  if (novel) {
    sort = novel.sort;
    filter = novel.filter;
    position = novel.position;
    showChapterTitles = novel.showChapterTitles;
  }

  return { sort, filter, position, showChapterTitles };
};

const useSavedSettings = () => {
  const settings = useSelector(state => state.preferenceReducer.novelSettings);

  return settings;
};

const useContinueReading = (chapters, novelId) => {
  let lastReadChapter, chapterId, novel, position;

  novel = useFindNovel(novelId);
  if (novel) {
    chapterId = novel.lastRead;
    position = novel.position;
  }

  if (chapterId) {
    lastReadChapter = chapters.find(
      obj => obj.chapterId === chapterId && obj.read === 0,
    );
  }

  // If the last read chapter is 100% done, set the next chapter as the 'last read'.
  // If all chapters are read, then set the last chapter in the list as the last read (Fixed bug)
  if (!lastReadChapter) {
    lastReadChapter = chapters.find(obj => obj.read === 0) || chapters[chapters.length - 1];
  }

  return { lastReadChapter, position };
};

const usePosition = (novelId, chapterId) => {
  let novel, position;

  novel = useFindNovel(novelId);

  if (novel) {
    if (novel.position) {
      position = novel.position[chapterId] || null;
    }
  }

  return position;
};

const useTrackingStatus = () => {
  const tracker = useSelector(state => state.trackerReducer);

  return tracker;
};

const useLibraryFilters = () => {
  const filters = useSelector(state => state.libraryReducer.filters);

  return filters;
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
  useLibraryFilters,
  usePosition,
};
