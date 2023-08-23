import * as cheerio from 'cheerio';
import RNFS from 'react-native-fs';

const sourceName = 'EPub';
const sourceId = 0;

const parseNovelAndChapters = async (epubPath: string) => {
  const files = await RNFS.readDir(epubPath);

  const metadataFile = files.find(f => f.name.endsWith('.json'))!;
  const metadata = JSON.parse(await RNFS.readFile(metadataFile.path));

  let novel = {
    sourceId,
    sourceName,
    url: epubPath,
    novelUrl: epubPath,

    novelName: metadata.title,
    novelCover: `file://${epubPath}/${metadata.cover}`,
    artist: metadata.artist,
    author: metadata.authors,
    summary: metadata.summary,
    status: 'Finished',

    chapters: metadata.chapters.map((chapter: any) => ({
      chapterName: chapter.name,
      chapterUrl: `file://${epubPath}/${chapter.path}`,
    })),
  };

  return novel;
};

const parseChapter = async (epubPath: string, chapterUrl: string) => {
  const files = await RNFS.readDir(epubPath);

  const metadataFile = files.find(f => f.name.endsWith('.json'))!;
  const metadata = JSON.parse(await RNFS.readFile(metadataFile.path));
  const chapterInfo = metadata.chapters.find((f: any) =>
    chapterUrl.includes(f.path),
  );

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
      const url = `${epubPath}/${src}`;
      loadedCheerio(this).replaceWith(`<img src="file://${url}"/>`);
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
      const style = await RNFS.readFile(`${epubPath}/${this.attribs.href}`);
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
