import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  // List of allowed CSS properties with regex patterns for margin and padding
  const allowedCSSProperties: RegExp[] = [
    /^align-items$/,
    /^background-color$/,
    /^border$/,
    /^border-.+$/,
    /^color$/,
    /^display$/,
    /^justify-content$/,
    /^margin$/,
    /^margin-.+$/,
    /^padding$/,
    /^padding-.+$/,
    /^text-align$/,
    /^text-shadow$/,
    /^text-transform$/,
  ];

  // List of tags to apply the style filter to
  const tagsToFilter = ['a', 'div', 'img', 'ol', 'p'];

  // Create a transform function for the specified tags
  const createTransformFunction = () => {
    return (tagName: string, attribs: any) => {
      if (attribs.style) {
        const styles = attribs.style.split(';');
        const allowedStyles = styles.filter((style: string) => {
          const [property] = style.split(':');
          return allowedCSSProperties.some(regex =>
            regex.test(property.trim()),
          );
        });
        return {
          tagName: tagName,
          attribs: {
            ...attribs,
            style: allowedStyles.join(';'),
          },
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { style, ...rest } = attribs;
      return {
        tagName: tagName,
        attribs: rest,
      };
    };
  };

  // Generate the transformTags object
  const transformTags: {
    [key: string]: (tagName: string, attribs: any) => any;
  } = {};
  tagsToFilter.forEach(tag => {
    transformTags[tag] = createTransformFunction();
  });

  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'a',
      'b',
      'div',
      'em',
      'i',
      'img',
      'li',
      'ol',
      'p',
      'span',
    ]),
    allowedAttributes: {
      'a': ['href', 'class', 'id', 'style'],
      'b': ['class', 'id', 'style'],
      'div': ['class', 'id', 'style'],
      'em': ['class', 'id', 'style'],
      'i': ['class', 'id', 'style'],
      'img': ['src', 'class', 'id', 'style'],
      'li': ['class', 'id', 'style'],
      'ol': ['reversed', 'start', 'type', 'style'],
      'p': ['class', 'id', 'style'],
      'span': ['class', 'id', 'style'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
    transformTags: transformTags,
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
