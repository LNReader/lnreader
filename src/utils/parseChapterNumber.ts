export const parseChapterNumber = (chapterName: string) => {
  chapterName = chapterName.toLowerCase();
  chapterName = chapterName.replace(/volume (\d+)|v(\d+)/, '');

  const basic = chapterName.match(/[ch]i (\d+)/);
  const occurrence = chapterName.match(/\d+/);

  if (basic) {
    return basic[0];
  } else if (occurrence) {
    return occurrence[0];
  } else {
    return -1;
  }
};
