import {
  ParsedChapter,
  SourceChapter,
  SourceChapterItem,
} from 'src/sources/types';

export const unifiedParser = (
  chapter: SourceChapter | SourceChapterItem,
): ParsedChapter => {
  const chapterName = chapter.chapterName;
  console.log(
    '🚀 ~ file: unifiedParser.ts:5 ~ unifiedParser ~ chapterName',
    chapterName,
  );
  const chapterText = chapter.chapterText;
  const chapterPrefix = '';
  return {
    ...chapter,
    chapterName: chapterName,
    chapterText: chapterText,
    chapterPrefix: chapterPrefix,
  };
};

const takeName = (chapterName: string): Array<string> => {
  let res = chapterName.split(/(.*\d)\W+(.*)/gm);
  if (res[2] === '' || res[2] === ' ') {
    res[1] = '';
    res[2] = chapterName;
  }
  return [res[1], res[2]];
};
