import {
  ParsedChapter,
  ParsedChapterItem,
  SourceChapter,
  SourceChapterItem,
} from 'src/sources/types';

export const unifiedParser = async (
  chapter: SourceChapter,
): Promise<ParsedChapter> => {
  const [chapterName, chapterPrefix] = parseName(chapter.chapterName);
  const chapterText = chapter.chapterText;

  return {
    ...chapter,
    chapterName: chapterName,
    chapterText: chapterText,
    chapterPrefix: chapterPrefix,
  };
};

export const unifiedParserMap = async (
  chapter: SourceChapterItem,
): Promise<ParsedChapterItem> => {
  const [chapterName, chapterPrefix] = parseName(chapter.chapterName);

  return {
    ...chapter,
    chapterName: chapterName,
    chapterPrefix: chapterPrefix,
  };
};

const parseName = (chapterName: string): Array<string> => {
  const prefixRegex =
    /(?:[c]\w+\s\d+[.]*\d*)|(?:[v]\w+\s\d+[.]*\d*\W*[c]\w+\s\d+[.]*\d*|[v]\w+\s\d+[.]*\d*)/i;

  let chapterPrefix = prefixRegex.exec(String(chapterName));
  if (chapterPrefix === null) {
    return [chapterName];
  }
  // TODO new ChapterName
  console.log(
    '🚀 ~ file: unifiedParser.ts:35 ~ chapterPrefix',
    chapterPrefix?.[0],
  );
  return [chapterName, chapterPrefix[0]];
};

/*
? prefixRegex is a regex witch returns the Prefix of the chapter with the    following examples:

Chapter 46 - Even One Worthy Friend Can Be Enough
Chapter 46 Even One Worthy Friend Can Be Enough
Chapter 46.22 - Even One Worthy Friend Can Be Enough
Chapter 46 - Even One Worthy Friend Can Be Enough 23
Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Chapter 46 - "Even One Worthy Friend Can Be Enough
Chapter 46 23 Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - Even One Worthy Friend Can Be Enough 23
Volume 2 Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Volume 2 - Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - "Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 23 Even One Worthy Friend Can Be Enough
Volume 2 23 Even One Worthy Friend Can Be Enough
*/
