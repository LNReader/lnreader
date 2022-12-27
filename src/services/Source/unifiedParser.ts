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
  let re = new RegExp(
    '<\\w+>\\s*' + chapterPrefix + '.{0,6}' + chapterName + '.{0,3}<[/]\\w+>',
    'i',
  );
  const chapterText = chapter.chapterText
    ?.replace(re, '')
    .replace(/<\w+>(<.{0,40}>)?<[/]\w+>/i, '');

  return {
    ...chapter,
    chapterName: chapterName,
    chapterText: chapterText,
    chapterPrefix: chapterPrefix,
  };
};

export const unifiedParserMap = (
  item: SourceChapterItem,
): ParsedChapterItem => {
  const [chapterName, chapterPrefix] = parseName(item.chapterName);

  return {
    ...item,
    chapterName: chapterName,
    chapterPrefix: chapterPrefix,
  };
};

const parseName = (chapterName: string): Array<string> => {
  const prefixRegex =
    /(?:[c]\w*\s*\d+[.]*\d*\s*|[v]\w*\s*\d+[.]*\d*\W*[c]\w*\s*\d+[.]*\d*\s*|[v]\w*\s*\d+[.]*\d*\s*)/i;

  let chapterPrefix = prefixRegex.exec(String(chapterName));
  if (chapterPrefix === null) {
    return [chapterName];
  }
  let newChapterName = chapterName
    .substring(
      chapterPrefix.index + chapterPrefix[0].length,
      chapterName.length,
    )
    .trim();
  newChapterName = newChapterName.replace(
    /[-–‐‑‒—⁃﹣:]+\s*[-–‐‑‒—⁃﹣:]+|[-–‐‑‒—⁃﹣:]+(?=\d*|\w*)/i,
    '',
  );

  return [newChapterName.trim(), chapterPrefix[0].trim()];
};

/*
? prefixRegex is a regex witch returns the Prefix of the chapter with the    following examples:

The Charm of Soul Pets Chapter 3 - Coerced into Death
Chapter 46 - Even One Worthy Friend Can Be Enough
Chapter 46 Even One Worthy Friend Can Be Enough
Chapter 46.22 - Even One Worthy Friend Can Be Enough
Chapter 46 - Even One Worthy Friend Can Be Enough 23
Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Chapter 46: - 1 Even One Worthy Friend Can Be Enough
Chapter 46:- 1 Even One Worthy Friend Can Be Enough
Chapter 46 - "Even One Worthy Friend Can Be Enough
Chapter 46 23 Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - Even One Worthy Friend Can Be Enough 23
Volume 2 Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Volume 2 - Chapter 46 - 1 Even One Worthy Friend Can Be Enough
Volume 2 - Chapter 46 : 1 Even One Worthy Friend Can Be Enough
Volume 2 - Chapter 46: 1 Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 - "Even One Worthy Friend Can Be Enough
Volume 2 Chapter 46 23 Even One Worthy Friend Can Be Enough
Volume 2 23 Even One Worthy Friend Can Be Enough
Chapter 23
C23
Chapter 209 – Meeting Yan Shuo again
*/
