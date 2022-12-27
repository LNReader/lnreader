export const parseChapterPrefix = (
  chapterPrefix: string,
  newPrefix: Array<string | null>,
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
  newPrefix: Array<string | null>,
) => {
  let chapterTitle;
  if (chapterPrefix) {
    if (newPrefix?.[0]) {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*/i, newPrefix[0]);
    } else {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
    }
    if (newPrefix?.[1]) {
      chapterTitle = chapterPrefix.replace(/[c]\w*\s*/i, newPrefix[1]);
    } else {
      chapterTitle = chapterPrefix.replace(/[v]\w*\s*\d+/i, '');
    }
  } else {
    return -1;
  }
  if (chapterName && newPrefix?.[2]) {
    return chapterTitle + newPrefix?.[2] + chapterName;
  }
  return chapterTitle;
};
