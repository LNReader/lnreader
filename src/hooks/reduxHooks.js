import { useSelector } from 'react-redux';

const useSettings = () => {
  const settings = useSelector(state => state.settingsReducer);

  return settings;
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
    lastReadChapter =
      chapters.find(obj => obj.read === 0) || chapters[chapters.length - 1];
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
