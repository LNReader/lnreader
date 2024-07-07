import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

interface Options {
  removeExtraParagraphSpacing?: boolean;
}

export const sanitizeChapterText = (
  html: string,
  options?: Options,
): string => {
  // List of disallowed CSS properties
  const allowedCSSProperties: RegExp[] = [
    /^align-items$/,
    /^background-color$/,
    /^border.*$/,
    /^display$/,
    /^font-weight$/,
    /^justify-content$/,
    /^margin.*$/,
    /^padding.*$/,
    /^position$/,
    /^text-align$/,
    /^text-decoration$/,
    /^text-justify$/,
    /^text-shadow$/,
    /^text-transform$/,
  ];

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
      // Only remove the style attribute if it's present
      if (attribs.style) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _style, ...rest } = attribs;
        return {
          tagName: tagName,
          attribs: rest,
        };
      } else {
        return {
          tagName: tagName,
          attribs: attribs,
        };
      }
    };
  };

  // List of allowed tags
  const styledTags = sanitizeHtml.defaults.allowedTags.concat([
    'div',
    'p',
    'span',
  ]);

  // Generate the transformTags object
  const transformTags: {
    [key: string]: (tagName: string, attribs: any) => any;
  } = {};
  styledTags.forEach(tag => {
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
      'a': ['href', 'class', 'id'],
      'div': ['class', 'id', 'style'],
      'img': ['src', 'class', 'id'],
      'ol': ['reversed', 'start'],
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
