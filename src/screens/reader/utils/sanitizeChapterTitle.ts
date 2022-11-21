export const sanitizeChapterTitle = (
  text: string,
  showChapterName: boolean | undefined,
  sourceChapterName: string,
): string => {
  let firstLines = text.split(/(.+\n)/gi, 6);
  const [chapterNumber, chapterName] = takeName(sourceChapterName);
  const nameOnLine = findChapterName(firstLines, chapterName);
  if (showChapterName === undefined) {
    return text;
  }
  if (nameOnLine !== -1) {
    text = deleteTitle(text, firstLines, nameOnLine);
  }
  if (showChapterName) {
    text =
      '<h3 style="margin-bottom:-20px">' +
      chapterNumber +
      '</h3>\n<h2>' +
      chapterName +
      '</h2>' +
      text;
  }
  return text;
};

const deleteTitle = (
  text: string,
  lines: Array<string>,
  nameOnLine: number,
): string => {
  let toDeleteText = '';
  for (let i = 0; i <= nameOnLine; i++) {
    toDeleteText += lines[i];
  }
  return text.replace(toDeleteText, '');
};
const findChapterName = (lines: Array<string>, chapterName: string) => {
  for (let index = 0; index < lines.length; index++) {
    if (lines[index].includes(chapterName)) {
      return index;
    }
  }
  return -1;
};
const takeName = (chapterName: string): Array<string> => {
  let res = chapterName.split(/(.*\d)\W*(.*)/gm);
  if (res[2] === '' || res[2] === ' ') {
    res[1] = '';
    res[2] = chapterName;
  }
  return [res[1], res[2]];
};
