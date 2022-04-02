import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (html: string) => {
  const text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: { 'img': ['src'] },
    allowedSchemes: ['data', 'http', 'https'],
  });

  return text;
};
