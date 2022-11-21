import sanitizeHtml from 'sanitize-html';
import { sanitizeChapterName } from './sanitizeChapterName';

interface Options {
  removeExtraParagraphSpacing?: boolean;
  showChapterName?: boolean;
  chapterName?: string;
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
    if (options?.chapterName) {
      text = sanitizeChapterName(
        text,
        options.showChapterName,
        options.chapterName,
      );
    }
  } else {
    text = "Chapter not available .\n\nReport if it's available in webview.";
  }

  return text;
};
