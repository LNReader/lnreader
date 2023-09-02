import * as cheerio from 'cheerio';
import RNFS from 'react-native-fs';
import { htmlToText } from '../helpers/htmlToText';

const sourceName = 'EPub';
const sourceId = 0;

const resolveRelativePath = (absPath: string, relPath: string): string => {
  const absPathParts = absPath.split('/');
  const relPathParts = relPath.split('/');

  let backNavigations = 0;
  relPathParts.forEach(p => p === '..' && backNavigations++);

  const newAbsPath = absPathParts
    .slice(0, absPathParts.length - backNavigations)
    .join('/');
  const newRelPath = relPathParts.slice(backNavigations).join('/');

  return `${newAbsPath}/${newRelPath}`;
};

const parseNovelAndChapters = async (epubPath: string) => {
  const metadata = JSON.parse(await RNFS.readFile(`${epubPath}/metadata.json`));

  let novel = {
    sourceId,
    sourceName,
    url: epubPath,
    novelUrl: epubPath,

    novelName: metadata.title,
    novelCover: `file://${epubPath}/${metadata.cover}`,
    artist: metadata.artist,
    author: metadata.authors,
    summary: htmlToText(metadata.summary),
    status: 'Completed',

    chapters: metadata.chapters.map((chapter: any) => ({
      chapterName: chapter.name,
      chapterUrl: `file://${epubPath}/${chapter.path}`,
    })),
  };

  return novel;
};

const parseChapter = async (epubPath: string, chapterUrl: string) => {
  const metadata = JSON.parse(await RNFS.readFile(`${epubPath}/metadata.json`));
  const chapterInfo = metadata.chapters.find((f: any) =>
    chapterUrl.includes(f.path),
  );

  const dirPath = chapterUrl.substring(0, chapterUrl.lastIndexOf('/'));
  let chapterText = await RNFS.readFile(chapterUrl);

  const loadedCheerio = cheerio.load(chapterText);
  const promises: Promise<number>[] = [];

  const imageReplace = function (this: cheerio.Element) {
    const src =
      this.attribs.src ??
      this.attributes.find(
        attr => attr.name.includes('src') || attr.name.includes('href'),
      )?.value;

    if (src === undefined) {
      loadedCheerio(this).remove();
      return;
    }

    const promise: Promise<number> = new Promise(async r => {
      const url = resolveRelativePath(dirPath, src);
      loadedCheerio(this).replaceWith(`<img src="${url}"/>`);
      r(0);
    });

    promises.push(promise);
  };

  // Specify images absolute path
  loadedCheerio('img').each(imageReplace);
  loadedCheerio('image').each(imageReplace);

  // Add styles
  loadedCheerio('link').each(function () {
    if (this.attribs.href === undefined) {
      return;
    }

    const promise: Promise<number> = new Promise(async r => {
      const path = resolveRelativePath(dirPath, this.attribs.href);
      const style = await RNFS.readFile(path);
      loadedCheerio(this).replaceWith(`<style>${style}</style>`);
      r(0);
    });

    promises.push(promise);
  });

  await Promise.all(promises);
  chapterText = loadedCheerio.html().replace(/href=".+?"/g, '');

  const chapter = {
    sourceId,
    novelUrl: epubPath,
    chapterUrl,
    chapterName: chapterInfo.name,
    chapterText,
  };

  return chapter;
};

const EPubSource = {
  parseNovelAndChapters,
  parseChapter,
};

export default EPubSource;
