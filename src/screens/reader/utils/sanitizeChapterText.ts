import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (html: string): string => {
  // List of disallowed CSS properties
  const disallowedCSSProperties: RegExp[] = [
    /^color$/,
    /^font.*$/,
    /^line-height$/,
    /^text-align.*$/,
    /^text-indent$/,
  ];

  // Create a transform function for the specified tags
  const createTransformFunction = () => {
    return (tagName: string, attribs: any) => {
      if (attribs.style) {
        const styles = attribs.style.split(';');
        const allowedStyles = styles.filter((style: string) => {
          const [property] = style.split(':');
          return !disallowedCSSProperties.some(regex =>
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
      const { _style, ...rest } = attribs;
      return {
        tagName: tagName,
        attribs: rest,
      };
    };
  };

  // List of styled tags
  const styledTags = sanitizeHtml.defaults.allowedTags;

  // Generate the transformTags object
  const transformTags: {
    [key: string]: (tagName: string, attribs: any) => any;
  } = {};
  styledTags.forEach(tag => {
    transformTags[tag] = createTransformFunction();
  });

  let text = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'title']),
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'class', 'id'],
      'div': ['class', 'id', 'style'],
      'img': ['src', 'srcset', 'alt', 'title', 'class', 'id'],
      'ol': ['reversed', 'start'],
      'p': ['class', 'id', 'style'],
      'span': ['class', 'id', 'style'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
    transformTags: transformTags,
  });
  return text || getString('readerScreen.emptyChapterMessage');
};
