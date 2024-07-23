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
      text = text
        .replace(/([\u200B-\u200D\uFEFF])(?<=<p>\1)/g, '')
        .replace(/(?:<br>\s*<\/?br>)+/g, '')
        .replace(/<br>\s*(?=<\/?p>)/g, '');
    }
  } else {
    text = getString('readerScreen.emptyChapterMessage');
  }
  return text;
};
