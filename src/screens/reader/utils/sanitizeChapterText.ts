import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';
import * as cheerio from 'cheerio';

export const sanitizeChapterText = (
  pluginId: string,
  novelName: string,
  chapterName: string,
  html: string,
): string => {
  // Parse the HTML with Cheerio
  const chapterCheerio = cheerio.load(html);

  // Remove unwanted elements from the chapter content
  chapterCheerio('noscript').remove(); // Remove script tags

  // Process images to handle lazy-loading attributes
  chapterCheerio('img').each((i, el) => {
    const $el = chapterCheerio(el);

    // Prioritize data-lazy-src or src for the main src attribute
    const imgSrc = $el.attr('data-lazy-src') || $el.attr('src');
    if (imgSrc) {
      $el.attr('src', imgSrc); // Set the src value
    }

    // Prioritize data-lazy-srcset or srcset for the srcset attribute
    const imgSrcset = $el.attr('data-lazy-srcset') || $el.attr('srcset');
    if (imgSrcset) {
      $el.attr('srcset', imgSrcset); // Set the srcset value
    }
  });

  // Sanitize the HTML to remove unwanted elements
  let sanitizedHtml = sanitizeHtml(chapterCheerio.html(), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'title']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'class', 'id'],
      div: ['class', 'id'],
      img: ['src', 'srcset', 'alt', 'title', 'class', 'id'],
      ol: ['reversed', 'start', 'type'],
      p: ['class', 'id'],
      span: ['class', 'id'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });

  // Return the sanitized and updated HTML or an error message
  return (
    sanitizedHtml ||
    getString('readerScreen.emptyChapterMessage', {
      pluginId,
      novelName,
      chapterName,
    })
  );
};
