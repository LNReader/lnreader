import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (html: string): string => {
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
  return text || getString('readerScreen.emptyChapterMessage');
};
