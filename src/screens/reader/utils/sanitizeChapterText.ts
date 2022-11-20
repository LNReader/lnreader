import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
  showChapterName?: boolean;
  chapterName: string;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      'img': ['src', 'type', 'file-src', 'file-id'],
      'a': ['href'],
    },
    allowedSchemes: ['data', 'http', 'https'],
  });

  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }

    let firstLines = text.split(/(.+\n)/gi, 6);
    let nameOnLine = findChapterName(firstLines, options?.chapterName);

    if (options?.showChapterName && nameOnLine == -1) {
      text = '<h2>' + options?.chapterName + '</h2>' + text;
    }else if(!options?.showChapterName && nameOnLine != -1){
      let toDeleteText =0;
      for (let i=0; i<= nameOnLine;i++){
        toDeleteText+= firstLines[i].length;
      }
      text = text.slice(0,toDeleteText);
    }
  } else {
    text = "Chapter not available .\n\nReport if it's available in webview.";
  }

  return text;
};

const findChapterName = (lines: Array<string>, chapterName?: string) => {
  if(chapterName){
  for (let index = 0; index < lines.length; index++) {
    if (lines[index].includes(chapterName)) {
      return index;
    }
  }
}
  return -1;
};
