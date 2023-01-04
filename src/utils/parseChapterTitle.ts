import { ChapterItem } from '@database/types';
import { useEffect, useState } from 'react';

export const parseChapterPrefix = (
  chapterPrefix: string,
  chapterPrefixStyle: Array<string>,
) => {
  if (chapterPrefix) {
    let chapterTitle;

    if (chapterPrefix.search(' ') !== -1) {
      chapterTitle =
        chapterPrefixStyle[0] +
        chapterPrefix.replace(' ', chapterPrefixStyle[1]);
    } else {
      chapterTitle = chapterPrefixStyle[1] + chapterPrefix;
    }
    return chapterTitle.trim();
  } else {
    return '';
  }
};
export const parseChapterNumber = (chapterPrefix: string) => {
  if (chapterPrefix) {
    let chapterNumber;

    if (chapterPrefix.search(' ') !== -1) {
      chapterNumber = chapterPrefix.replace(/.*\s+/, '');
    } else {
      chapterNumber = chapterPrefix;
    }
    return chapterNumber.trim();
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
