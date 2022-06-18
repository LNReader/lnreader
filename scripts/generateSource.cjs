/**
 * This script can be used to generate sources
 */

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const prettierConfig = require('../.prettierrc');

const AllSources = require('../src/sources/sources.json');

const getLanguageCode = language => {
  const codes = {
    English: 'en',
    Arabic: 'ar',
    French: 'fr',
    Turkish: 'tr',
    Chinese: 'cn',
    Japanese: 'jp',
    Vietnamese: 'vi',
  };

  return codes[language];
};

try {
  if (process.argv[2]) {
    const source = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), process.argv[2]), 'utf8'),
    );

    const isDuplicate = AllSources.some(
      item => item.sourceId === source.sourceId,
    );

    const content = `
    import * as cheerio from 'cheerio';
    import { isUrlAbsolute } from '../../utils/isAbsoluteUrl';
    ${
      source?.options?.imports?.toaster
        ? "import { showToast } from '../../hooks/showToast'"
        : ''
    };
    import {
      SourceChapter,
      SourceChapterItem,
      SourceNovel,
      SourceNovelItem,
    } from '../types';
    
    const sourceId = ${source.sourceId};
    const sourceName = "${source.sourceName}";
    const baseUrl = "${source.baseUrl}";
    
    ${
      !source.popularNovels.url.includes('${page}')
        ? '// eslint-disable-next-line @typescript-eslint/no-unused-vars'
        : ''
    }
    const popularNovels = async (page: number) => {
      const totalPages = ${source.popularNovels.totalPages};
      const url = \`${source.popularNovels.url}\`;
    
      const result = await fetch(url);
      const body = await result.text();
    
      const loadedCheerio = cheerio.load(body);
    
      const novels: SourceNovelItem[] = [];
    
      loadedCheerio('${
        source.popularNovels.selectors.novelList
      }').each(function () {
        let novelUrl = loadedCheerio(this).find('${
          source.popularNovels.selectors.novelUrl
        }').attr('href');
    
        if (novelUrl && !isUrlAbsolute(novelUrl)) {
          novelUrl = baseUrl + novelUrl;
        }
    
        if (novelUrl) {
          const novelName = loadedCheerio(this).find('${
            source.popularNovels.selectors.novelName
          }').text().trim();
          let novelCover = loadedCheerio(this).find('${
            source.popularNovels.selectors.novelCover
          }').attr('src');
    
          if (novelCover && !isUrlAbsolute(novelCover)) {
            novelCover = baseUrl + novelCover;
          }
    
          const novel = {
            sourceId,
            novelUrl,
            novelName,
            novelCover,
          };
    
          novels.push(novel);
        }
      });
    
      return { totalPages, novels };
    };
    
    const parseNovelAndChapters = async (novelUrl: string) => {
      const url = novelUrl;
    
      const result = await fetch(url);
      const body = await result.text();
    
      let loadedCheerio = cheerio.load(body);
    
      const novel: SourceNovel = {
        sourceId,
        sourceName,
        url: novelUrl,
        novelUrl,
        chapters: [],
      };
    
      novel.novelName = loadedCheerio('${
        source.novelAndChapters.selectors.novelName
      }').text();
    
      let novelCover = loadedCheerio('${
        source.novelAndChapters.selectors.novelCover
      }').attr('src');
    
      novel.novelCover = novelCover
        ? isUrlAbsolute(novelCover)
          ? novelCover
          : baseUrl + novelCover
        : undefined;
    
      novel.summary = loadedCheerio('${
        source.novelAndChapters.selectors.summary
      }').text().trim();
    
      novel.author = loadedCheerio('${
        source.novelAndChapters.selectors.author
      }').text().trim();
    
      novel.genre = loadedCheerio('${
        source.novelAndChapters.selectors.genre
      }').text().trim()${source?.options?.status?.replace || ''};

    
      novel.status = loadedCheerio('${
        source.novelAndChapters.selectors.status
      }').text().trim();
    
      loadedCheerio('${
        source.novelAndChapters.selectors.chapterList
      }').each(function () {
        let chapterUrl = loadedCheerio(this).find('a').attr('href');
    
        if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
          chapterUrl = baseUrl + chapterUrl;
        }
    
        if (chapterUrl) {
          const chapterName = loadedCheerio(this).find('${
            source.novelAndChapters.selectors.chapterName
          }').text().trim();
          const releaseDate = ${
            source.novelAndChapters.selectors.releaseDate
              ? `loadedCheerio(this).find('${source.novelAndChapters.selectors.releaseDate}').text();`
              : null
          }
    
          const chapter: SourceChapterItem = {
            chapterName,
            releaseDate,
            chapterUrl,
          };
    
          novel.chapters?.push(chapter);
        }
      });
    
      return novel;
    };
    
    const parseChapter = async (novelUrl: string, chapterUrl: string) => {
      const url = chapterUrl;
    
      const result = await fetch(url);
      const body = await result.text();
    
      const loadedCheerio = cheerio.load(body);
    
      const chapterName = loadedCheerio('${
        source.chapter.selectors.chapterName
      }').text();
      const chapterText = loadedCheerio('${
        source.chapter.selectors.chapterText
      }').html() || '';
    
      const chapter: SourceChapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
      };
    
      return chapter;
    };
    
    ${
      !source.search.url.includes('${searchTerm}')
        ? '// eslint-disable-next-line @typescript-eslint/no-unused-vars'
        : ''
    }
    const searchNovels = async (searchTerm: string) => {
    ${
      source.search
        ? `
      const url = \`${source.search.url}\`;
    
      const result = await fetch(url);
      const body = await result.text();
    
      const loadedCheerio = cheerio.load(body);
    
      const novels: SourceNovelItem[] = [];
    
      loadedCheerio('${source.search.selectors.novelList}').each(function () {
        let novelUrl = loadedCheerio(this).find('${source.search.selectors.novelUrl}').attr('href');

        if (novelUrl && !isUrlAbsolute(novelUrl)) {
          novelUrl = baseUrl + novelUrl;
        }
  
        if (novelUrl) {
          const novelName = loadedCheerio(this).find('${source.search.selectors.novelName}').text();
          let novelCover = loadedCheerio(this).find('${source.search.selectors.novelCover}').attr('src');
    
          if (novelCover && !isUrlAbsolute(novelCover)) {
            novelCover = baseUrl + novelCover;
          }
    
          novels.push({
            sourceId,
            novelUrl,
            novelName,
            novelCover,
          });
        }
      });
    
      return novels;`
        : `
      showToast('${source.sourceName}: Search is not available in this source')
      
      return [];
      `
    }
    };
    
    const ${source.sourceName}Scraper = {
      popularNovels,
      parseNovelAndChapters,
      parseChapter,
      searchNovels,
    };
    
    export default ${source.sourceName}Scraper;
    
    `;

    const formatContent = prettier.format(content, {
      parser: 'typescript',
      ...prettierConfig,
    });

    fs.writeFile(
      path.resolve(
        process.cwd(),
        `src/sources/${getLanguageCode(source.lang)}/${source.sourceName}.ts`,
      ),
      formatContent,
      error => {
        if (error) {
          console.log(error);
        }
      },
    );

    if (!isDuplicate) {
      let allSourcesContent = AllSources;

      allSourcesContent.push({
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        icon: `https://github.com/LNReader/lnreader-sources/blob/main/src/${getLanguageCode(
          source.lang,
        )}/${source.sourceName.toLowerCase()}/icon.png?raw=true`,
        url: source.baseUrl,
        lang: source.lang || 'English',
      });

      allSourcesContent = prettier.format(JSON.stringify(allSourcesContent), {
        parser: 'json',
        ...prettierConfig,
      });

      fs.writeFile(
        path.resolve(process.cwd(), 'src/sources/sources.json'),
        allSourcesContent,
        error => {
          if (error) {
            console.log(error);
          }
        },
      );
    } else {
      console.log('Source with same id already exists');
    }
  } else {
    console.log('Template path not provided');
  }
} catch (e) {
  console.log(e);
}
