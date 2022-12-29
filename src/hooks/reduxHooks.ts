import { ChapterItem } from '@database/types';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

const useSettings = () => {
  const settings = useSelector((state: RootState) => state.settingsReducer);

  return settings;
};

const useNovel = () => {
  const novel = useSelector((state: RootState) => state.novelReducer);

  return novel;
};

const useChapter = () => {
  const chapter = useSelector((state: RootState) => state.chapterReducer);

  return chapter;
};

const useFindNovel = (novelId: number) => {
  let novel = useSelector(
    (state: RootState) => state.preferenceReducer.novelSettings,
  );
  novel = novel[novelId];

  return novel;
};

const usePreferences = (novelId: number) => {
  let sort,
    filter,
    position,
    showGeneratedChapterTitle,
    showChapterPrefix,
    chapterTitleSeperator,
    chapterPrefixStyle;

  const novel = useFindNovel(novelId);

  if (novel) {
    sort = novel.sort;
    filter = novel.filter;
    position = novel.position;
    showGeneratedChapterTitle = novel.showGeneratedChapterTitle;
    showChapterPrefix = novel.showChapterPrefix;
    chapterPrefixStyle = novel.chapterPrefixStyle;
    chapterTitleSeperator = novel.chapterTitleSeperator;
  }

  return {
    sort,
    filter,
    position,
    showGeneratedChapterTitle,
    showChapterPrefix,
    chapterPrefixStyle,
    chapterTitleSeperator,
  };
};

const useSavedSettings = () => {
  const settings = useSelector(
    (state: RootState) => state.preferenceReducer.novelSettings,
  );

  return settings;
};

const useContinueReading = (chapters: Array<ChapterItem>, novelId: number) => {
  let lastReadChapter, chapterId: number, novel, position;

  novel = useFindNovel(novelId);

  chapterId = novel?.lastRead;
  position = novel?.position;

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

const usePosition = (novelId: number, chapterId: number) => {
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
  const tracker = useSelector((state: RootState) => state.trackerReducer);

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
