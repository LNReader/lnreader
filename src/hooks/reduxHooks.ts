import { ChapterInfo } from '@database/types';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';

const useFindNovel = (novelId: number) => {
  let novelSettings = useSelector(
    (state: RootState) => state.preferenceReducer.novelSettings,
  );
  const novel = novelSettings[novelId];

  return novel;
};

const useContinueReading = (chapters: ChapterInfo[], novelId: number) => {
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
      chapters.find(obj => !obj.unread) || chapters[chapters.length - 1];
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

export { useContinueReading, usePosition };
