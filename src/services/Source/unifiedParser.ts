import {
  ParsedChapter,
  ParsedChapterItem,
  SourceChapter,
  SourceChapterItem,
} from 'src/sources/types';

export const unifiedParser = async (
  chapter: SourceChapter,
): Promise<ParsedChapter> => {
  const [chapterPrefix, chapterName] = parseName(chapter.chapterName);
  let re = new RegExp(
    '<\\w+>\\s*' + chapterPrefix + '.{0,6}' + chapterName + '.{0,3}<[/]\\w+>',
    'i',
  );
  const chapterText = chapter.chapterText
    ?.replace(re, '')
    .replace(/<\w+>\S*<[/]\w+>/i, '');

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
  const [chapterPrefix, chapterName] = parseName(item.chapterName);

  return {
    ...item,
    chapterName: chapterName,
    chapterPrefix: chapterPrefix,
  };
};

const parseName = (chapterName: string): Array<string> => {
  const prefixRegex =
    /(?:[c]\w*\s*\d+[.]*\d*\s*|[v]\w*\s*\d+[.]*\d*\W*[c]\w*\s*\d+[.]*\d*\s*|[v]\w*\s*\d+[.]*\d*\s*|\d+\s*(?=[-–‐‑‒—⁃﹣:])|(?<!.+)\s*\d+\s*(?!.+))/i;

  let chapterPrefix = prefixRegex.exec(String(chapterName));
  if (chapterPrefix === null) {
    return ['', chapterName.trim()];
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

  return [chapterPrefix[0].trim(), newChapterName.trim()];
};

/*
? prefixRegex is a regex witch returns the Prefix of the chapter with the    following examples:

22
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
209 – Meeting Yan Shuo again
*/
