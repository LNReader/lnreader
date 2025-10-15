import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (
  pluginId: string,
  novelName: string,
  chapterName: string,
  html: string,
): string => {
  const text = sanitizeHtml(html, {
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
      'details',
      'summary',
    ]),
    allowedAttributes: {
      '*': ['data-*'],
      a: ['href', 'class', 'id'],
      div: ['class', 'id'],
      img: ['src', 'class', 'id'],
      ol: ['reversed', 'start', 'type'],
      p: ['class', 'id'],
      span: ['class', 'id'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });

  // Return the sanitized and updated HTML or an error message
  return (
    text ||
    getString('readerScreen.emptyChapterMessage', {
      pluginId,
      novelName,
      chapterName,
    })
  );
};
