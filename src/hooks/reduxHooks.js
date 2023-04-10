import { useSelector } from 'react-redux';

const useSettings = () => {
  const settings = useSelector(state => state.settingsReducer);

  return settings;
};

const useNovel = () => {
  const { novel, chapters, loading, updating } = useSelector(
    state => state.novelReducer,
  );
  return { novel, chapters, loading, updating };
};

const useFindNovel = novelId => {
  let novelSettings = useSelector(
    state => state.preferenceReducer.novelSettings,
  );
  novel = novelSettings[novelId];

  return novel;
};

const usePreferences = novelId => {
  let sort, filter, position, showChapterTitles;

  const novel = useFindNovel(novelId);

  if (novel) {
    sort = novel.sort;
    filter = novel.filter;
    showChapterTitles = novel.showChapterTitles;
  }

  return { sort, filter, showChapterTitles };
};

const useSavedSettings = () => {
  const settings = useSelector(state => state.preferenceReducer.novelSettings);

  return settings;
};

const useContinueReading = (chapters, novelId) => {
  let lastReadChapter, novel, position;
  novel = useFindNovel(novelId);
  if (novel && novel.lastRead) {
    lastReadChapter = novel.lastRead;
    position = novel.position;
  }

  if (lastReadChapter && position) {
    lastReadChapter =
      position[lastReadChapter.id]?.percentage >= 97
        ? undefined
        : lastReadChapter;
  } else {
    // for the first time
    lastReadChapter = chapters[0];
  }

  // If the last read chapter is 100% done, set the next chapter as the 'last read'.
  // If all chapters are read, then set the last chapter in the list as the last read (Fixed bug)
  if (!lastReadChapter && chapters) {
    lastReadChapter =
      chapters.find(obj => obj.unread === 0) || chapters[chapters.length - 1];
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

export {
  useSettings,
  usePreferences,
  useContinueReading,
  useTrackingStatus,
  useNovel,
  useSavedSettings,
  usePosition,
};
