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

const useChapter = () => {
  const chapter = useSelector(state => state.chapterReducer);

  return chapter;
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
  if (novel && novel.lastRead) {
    chapterId = novel.lastRead.id;
    position = novel.position;
  }

  if (chapterId) {
    lastReadChapter = chapters.find(
      obj => obj.id === chapterId && obj.unread === 1,
    );
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
  useChapter,
  useSavedSettings,
  usePosition,
};
