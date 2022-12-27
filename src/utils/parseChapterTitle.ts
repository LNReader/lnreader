import { usePreferences } from '@hooks/reduxHooks';

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
  seperator?: boolean,
) => {
  let chapterTitle;
  if (chapterPrefix) {
    if (newPrefix?.[0] || newPrefix?.[0] === '') {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*/i, newPrefix[0]);
    } else {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
    }
    if (newPrefix?.[1] || newPrefix?.[1] === '') {
      chapterTitle = chapterTitle.replace(/[c]\w*\s*/i, newPrefix[1]);
    } else {
      chapterTitle = chapterTitle.replace(/[v]\w*\s*\d+/i, '');
    }
  } else {
    return -1;
  }
  if (chapterName) {
    if (seperator) {
      return chapterTitle + ' - ' + chapterName;
    }
    return chapterTitle + ' ' + chapterName;
  }
  return chapterTitle.trim();
};

export const useChapterTitle = (
  chapterPrefix: string | undefined,
  chapterName: string | undefined,
  novelId: number,
) => {
  const {
    showChapterPrefix = true,
    chapterPrefixStyle = ['Volume ', 'Chapter '],
    chapterTitleSeperator = true,
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
