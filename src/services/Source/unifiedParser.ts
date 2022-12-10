import { ParsedChapter, SourceChapter } from 'src/sources/types';

export const unifiedParser = (chapter: SourceChapter): ParsedChapter => {
  const chapterName = chapter.chapterName;
  const chapterText = chapter.chapterText;
  const chapterPrefix = '';
  return {
    ...chapter,
    chapterName: chapterName,
    chapterText: chapterText,
    chapterPrefix: chapterPrefix,
  };
};
