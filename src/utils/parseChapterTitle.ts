import { ChapterItem } from '@database/types';
import { usePreferences, useSettings } from '@hooks/reduxHooks';

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
  chapterPrefix: string | undefined,
  chapterName: string | undefined,
  newPrefix: Array<string | null>,
  seperator?: string,
) => {
  let chapterTitle;
  if (chapterPrefix) {
    if (newPrefix?.[0] || newPrefix?.[0] === '') {
      chapterTitle = chapterPrefix.replace(
        /[v][a-zA-Z]*\s*(?=\d+)/i,
        newPrefix[0],
      );
    } else {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
    }
    if (newPrefix?.[1] || newPrefix?.[1] === '') {
      chapterTitle = chapterTitle.replace(
        /[c][a-zA-Z]*\s*(?=\d+)/i,
        newPrefix[1],
      );
      if (chapterTitle.charAt(0) !== 'C' && newPrefix?.[1] !== '') {
        chapterTitle = newPrefix[1] + chapterTitle;
      }
    } else {
      chapterTitle = chapterTitle.replace(/[v]\w*\s*\d+/i, '');
    }
  } else {
    return chapterName;
  }
  if (chapterName) {
    if (seperator || seperator === '') {
      return (chapterTitle + seperator + chapterName).trim();
    }
    return (chapterTitle + ' ' + chapterName).trim();
  }
  return chapterTitle.trim();
};

export const useChapterTitle = (
  chapterPrefix: string | undefined,
  chapterName: string | undefined,
  novelId: number,
) => {
  const {
    defaultShowChapterPrefix = true,
    defaultChapterPrefixStyle = ['Volume ', 'Chapter '],
    defaultChapterTitleSeperator = ' - ',
  } = useSettings();
  const {
    showChapterPrefix = defaultShowChapterPrefix,
    chapterPrefixStyle = defaultChapterPrefixStyle,
    chapterTitleSeperator = defaultChapterTitleSeperator,
  } = usePreferences(novelId);
  if (!showChapterPrefix) {
    return chapterName;
  }

  let chapterTitle = parseChapterTitle(
    chapterPrefix,
    chapterName,
    chapterPrefixStyle,
    chapterTitleSeperator,
  );

  return chapterTitle;
};

export const useMultipleChapterTitles = (
  chapters: Array<ChapterItem>,
  novelId: number,
): Array<string | undefined> => {
  const {
    defaultShowChapterPrefix = true,
    defaultChapterPrefixStyle = ['Volume ', 'Chapter '],
    defaultChapterTitleSeperator = ' - ',
  } = useSettings();
  const {
    showChapterPrefix = defaultShowChapterPrefix,
    chapterPrefixStyle = defaultChapterPrefixStyle,
    chapterTitleSeperator = defaultChapterTitleSeperator,
  } = usePreferences(novelId);
  const chapterTitles = chapters.map(item => {
    if (!showChapterPrefix) {
      return item.chapterName;
    }
    return parseChapterTitle(
      item.chapterPrefix,
      item.chapterName,
      chapterPrefixStyle,
      chapterTitleSeperator,
    );
  });
  return chapterTitles;
};

export const useMultipleChapterTitlesWithoutNovel = (
  chapters: Array<ChapterItem>,
): Array<string | undefined> => {
  const {
    defaultShowChapterPrefix = true,
    defaultChapterPrefixStyle = ['Volume ', 'Chapter '],
    defaultChapterTitleSeperator = ' - ',
  } = useSettings();
  const chapterTitles = chapters.map(item => {
    if (!defaultShowChapterPrefix) {
      return item.chapterName;
    }
    return parseChapterTitle(
      item.chapterPrefix,
      item.chapterName,
      defaultChapterPrefixStyle,
      defaultChapterTitleSeperator,
    );
  });
  return chapterTitles;
};
