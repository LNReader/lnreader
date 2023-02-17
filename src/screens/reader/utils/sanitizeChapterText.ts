import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
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
  } else {
    text =
      "Chapter is empty.\n\nReport on <a href='https://github.com/LNReader/lnreader-sources/issues/new/choose'>github</a> if it's available in webview.";
  }

  return text;
};
