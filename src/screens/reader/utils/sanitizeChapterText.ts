import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (
  pluginId: string,
  novelName: string,
  chapterName: string,
  html: string,
  disableReaderImages = false,
): string => {
  const extraTags: string[] = ['i', 'em', 'b', 'a', 'div', 'ol', 'li', 'title'];

  const extraAttributes: { [key: string]: string[] } = {
    'a': ['href', 'class', 'id'],
    'div': ['class', 'id'],
    'p': ['class', 'id'],
    'ol': ['reversed', 'start', 'type'],
  };

  if (!disableReaderImages) {
    extraTags.push('img');
    extraAttributes.img = ['src', 'class', 'id'];
  }

  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(extraTags),
    allowedAttributes: extraAttributes,
    allowedSchemes: ['data', 'http', 'https', 'file'],
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
