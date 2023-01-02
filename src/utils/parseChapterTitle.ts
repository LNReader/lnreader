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
    return '';
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

  if (chapterPrefix.search(' ') !== -1) {
    chapterTitle =
      chapterPrefixStyle[0] + chapterPrefix.replace(' ', chapterPrefixStyle[1]);
  } else {
    chapterTitle = chapterPrefixStyle[1] + chapterPrefix;
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
  const { chapterPrefix, chapterName, chapterId } = chapter
    ? chapter
    : { chapterPrefix: '', chapterName: '', chapterId: 0 };
  const [chapterTitle, setChapterTitle] = useState('');
  useEffect(() => {
    if (chapter) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
