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
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/<br>\s*(?=<\/p>)/g, '')
        .replace(/<br>\s*(?<=\/p><br>)(?=<p>)/g, '')
        .replace(/(?:<br>\s*<\/?br>)+/g, '')
        .replace(/\n\n+/g, '\n');
    }
  } else {
    text = getString('readerScreen.emptyChapterMessage');
  }
  return text;
};
