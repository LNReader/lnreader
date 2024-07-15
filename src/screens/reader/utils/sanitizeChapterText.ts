import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'i',
      'em',
      'b',
      'a',
      'div',
      'ol',
      'li',
      'title',
    ]),
    allowedAttributes: {
      'img': ['src', 'class', 'id'],
      'a': ['href', 'class', 'id'],
      'div': ['class', 'id'],
      'p': ['class', 'id'],
      'ol': ['reversed', 'start', 'type'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });
  if (text) {
    if (options?.removeExtraParagraphSpacing) {
      text = text.replace(/<\s*br[^>]*>/gi, '\n').replace(/\n{2,}/g, '\n\n');
    }
  } else {
    text = getString('readerScreen.emptyChapterMessage');
  }
  return text;
};
