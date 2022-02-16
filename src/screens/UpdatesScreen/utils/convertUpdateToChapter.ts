import {Update, ChapterItem} from '../../../database/types';

export const converUpdateToChapter = (update: Update): ChapterItem => {
  const {
    chapterName,
    bookmark,
    chapterId,
    chapterUrl,
    downloaded,
    novelId,
    read,
    releaseDate,
  } = update;

  return {
    chapterName,
    bookmark,
    chapterId,
    chapterUrl,
    downloaded,
    novelId,
    read,
    releaseDate,
  };
};
