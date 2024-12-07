import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (
  pluginId: string,
  novelName: string,
  chapterName: string,
  html: string,
): string => {
  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'title']),
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'class', 'id'],
      'div': ['class', 'id'],
      'img': ['src', 'srcset', 'alt', 'title', 'class', 'id'],
      'ol': ['reversed', 'start', 'type'],
      'p': ['class', 'id'],
      'span': ['class', 'id'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data', 'file', 'blob'],
    },
  });
  return (
    text ||
    getString('readerScreen.emptyChapterMessage', {
      pluginId,
      novelName,
      chapterName,
    })
  );
};
