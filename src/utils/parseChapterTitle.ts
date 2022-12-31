import { setChapterTitleInDB } from '@database/queries/ChapterQueries';
import { ChapterItem } from '@database/types';
import { useEffect, useState } from 'react';

export const parseChapterPrefix = (
  chapterPrefix: string,
  newPrefix?: Array<string | null>,
) => {
  if (chapterPrefix) {
    if (newPrefix?.[0]) {
      chapterPrefix = chapterPrefix.replace(/[v]\w*\s*/i, newPrefix[0]);
    } else {
      chapterPrefix = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
    }
    if (newPrefix?.[1]) {
      return (chapterPrefix = chapterPrefix.replace(
        /[c]\w*\s*/i,
        newPrefix[1],
      ));
    }
    return (chapterPrefix = chapterPrefix.replace(/[c]\w*\s*/i, '').trim());
  } else {
    return -1;
  }
};

export const parseChapterTitle = (
  chapterPrefix: string,
  chapterName: string,
  chapterPrefixStyle: Array<string>,
  generatedChapterTitle: boolean,
  showChapterPrefix: boolean,
  index: number,
  seperator?: string,
) => {
  if (generatedChapterTitle) {
    return chapterPrefixStyle[1] + (index + 1);
  }
  if (!chapterPrefix || !showChapterPrefix) {
    return chapterName;
  }
  let chapterTitle;

  if (chapterPrefixStyle?.[0] || chapterPrefixStyle?.[0] === '') {
    chapterTitle = chapterPrefix.replace(
      /[v][a-zA-Z]*\s*(?=\d+)/i,
      chapterPrefixStyle[0],
    );
  } else {
    chapterTitle = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
  }
  if (chapterPrefixStyle?.[1] || chapterPrefixStyle?.[1] === '') {
    chapterTitle = chapterTitle.replace(
      /[c][a-zA-Z]*\s*(?=\d+)/i,
      chapterPrefixStyle[1],
    );
    if (chapterTitle.charAt(0) !== 'C' && chapterPrefixStyle?.[1] !== '') {
      chapterTitle = chapterPrefixStyle[1] + chapterTitle;
    }
  } else {
    chapterTitle = chapterTitle.replace(/[v]\w*\s*\d+/i, '');
  }

  if (!chapterName) {
    return chapterTitle.trim();
  }
  if (seperator || seperator === '') {
    return (chapterTitle + seperator + chapterName).trim();
  }
  return (chapterTitle + ' ' + chapterName).trim();
};

export interface chapterTitleOptionsType {
  chapterPrefixStyle: Array<string>;
  showGeneratedChapterTitle: boolean;
  showChapterPrefix: boolean;
  chapterTitleSeperator: string;
}

export const useChapterTitle = (
  chapter: ChapterItem,
  index: number,
  chapterTitleOptions: chapterTitleOptionsType,
) => {
  const {
    chapterPrefixStyle,
    showGeneratedChapterTitle,
    showChapterPrefix,
    chapterTitleSeperator,
  } = chapterTitleOptions;
  const { chapterPrefix, chapterName, chapterId } = chapter;
  const [chapterTitle, setChapterTitle] = useState('');
  useEffect(() => {
    const chapTitle = parseChapterTitle(
      chapterPrefix,
      chapterName,
      chapterPrefixStyle,
      showGeneratedChapterTitle,
      showChapterPrefix,
      index,
      chapterTitleSeperator,
    );

    setChapterTitleInDB(chapTitle, chapterId);
    setChapterTitle(chapTitle);
  }, [
    chapterPrefix,
    chapterName,
    chapterPrefixStyle,
    chapterTitleSeperator,
    index,
    showChapterPrefix,
    showGeneratedChapterTitle,
    chapterId,
  ]);
  return chapterTitle;
};

export const parseChapterTitleV2 = (
  item: ChapterItem,
  chapterPrefixStyle: Array<string>,
  generatedChapterTitle: boolean,
  showChapterPrefix: boolean,
  index: number,
  seperator?: string,
) => {
  if (generatedChapterTitle) {
    return { ...item, chapterTitle: chapterPrefixStyle[1] + (index + 1) };
  }
  if (!item.chapterPrefix || !showChapterPrefix) {
    return { ...item, chapterTitle: item.chapterName };
  }
  let chapterTitle;

  if (chapterPrefixStyle?.[0] || chapterPrefixStyle?.[0] === '') {
    chapterTitle = item.chapterPrefix.replace(
      /[v][a-zA-Z]*\s*(?=\d+)/i,
      chapterPrefixStyle[0],
    );
  } else {
    chapterTitle = item.chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
  }
  if (chapterPrefixStyle?.[1] || chapterPrefixStyle?.[1] === '') {
    chapterTitle = chapterTitle.replace(
      /[c][a-zA-Z]*\s*(?=\d+)/i,
      chapterPrefixStyle[1],
    );
    if (chapterTitle.charAt(0) !== 'C' && chapterPrefixStyle?.[1] !== '') {
      chapterTitle = chapterPrefixStyle[1] + chapterTitle;
    }
  } else {
    chapterTitle = chapterTitle.replace(/[v]\w*\s*\d+/i, '');
  }

  if (!item.chapterName) {
    return { ...item, chapterTitle: chapterTitle.trim() };
  }
  if (seperator || seperator === '') {
    return {
      ...item,
      chapterTitle: (chapterTitle + seperator + item.chapterName).trim(),
    };
  }
  return {
    ...item,
    chapterTitle: (chapterTitle + ' ' + item.chapterName).trim(),
  };
};

export const setChapterTitles = (
  chapters: Array<ChapterItem>,
  chapterPrefixStyle: Array<string>,
  generatedChapterTitle: boolean,
  showChapterPrefix: boolean,
  seperator?: string,
) => {
  let res: Array<string> = [];
  chapters.map((item: ChapterItem, index: number) => {
    item = parseChapterTitleV2(
      item,
      chapterPrefixStyle,
      generatedChapterTitle,
      showChapterPrefix,
      index,
      seperator,
    );
    setChapterTitleInDB(item.chapterTitle, item.chapterId);
    res.push(item.chapterTitle);
  });
  return res;
};
