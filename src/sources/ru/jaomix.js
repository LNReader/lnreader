import * as cheerio from 'cheerio';

const sourceId = 117;
const sourceName = 'Jaomix';

const baseUrl = 'https://jaomix.ru';

const popularNovels = async page => {
  const result = await fetch(baseUrl + '/?gpage=' + page);
  const totalPages = 50;
  let body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let novels = [];

  loadedCheerio('div[class="block-home"] > div[class="one"]').each(function() {
    const novelName = loadedCheerio(this).find('div[class="img-home"] > a').attr('title');
    const novelCover = loadedCheerio(this).find('div[class="img-home"] > a > img')
      .attr('src').replace("-150x150", "");
    const novelUrl = loadedCheerio(this).find('div[class="img-home"] > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return { totalPages, novels };
}

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div[class="desc-book"] > h1').text().trim();
  novel.novelCover = loadedCheerio('div[class="img-book"] > img').attr('src');
  novel.summary = loadedCheerio('div[id="desc-tab"]').text().trim();

  const termid = loadedCheerio('div[class="like-but"]').attr('id')
  const chapters = [];

  let formData = new FormData();
  formData.append('action', 'toc');
  formData.append('selectall', termid);

  let doc = await fetch(baseUrl + '/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: formData
  });
  let results2 = await doc.text()
  let loadedCheerio2 = cheerio.load(results2)
  let page = loadedCheerio2('option').length

  for (let i = 0; i < page; i++) {
    if (i == 0) {
      loadedCheerio2 = loadedCheerio
    } else {
      formData = new FormData();
      formData.append('action', 'toc');
      formData.append('page', i);
      formData.append('termid', termid);
      doc = await fetch(baseUrl + '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
      });
      results2 = await doc.text()
      loadedCheerio2 = cheerio.load(results2)
    }

    loadedCheerio2('div[class="hiddenstab active"] > div > div[class="flex-dow-txt"]').each(function() {
      const chapterName = loadedCheerio2(this).find('div[class="title"] > a').attr("title")
      const releaseDate = loadedCheerio2(this).find('time').text();
      const chapterUrl = loadedCheerio2(this).find('div[class="title"] > a').attr("href");

      chapters.push({ chapterName, releaseDate, chapterUrl });
    });
  }

  novel.chapters = chapters.reverse();
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(baseUrl + chapterUrl);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  loadedCheerio('img').each(function() {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      let src = loadedCheerio(this).attr('src');
      loadedCheerio(this).attr('src', baseUrl + src);
    }
  })
  loadedCheerio('div[class="adblock-service"]').remove()
  const chapterName = loadedCheerio('h1[class="entry-title"]').html();
  const chapterText = loadedCheerio('div[class="entry-content"]').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: chapterName,
    chapterText: chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}/?search=${searchTerm}&but=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA+%D0%BF%D0%BE+%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8E&sortby=new`;
  const result = await fetch(url);
  let body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let novels = [];
  loadedCheerio('div[class="block-home"] > div[class="one"]').each(function() {
    const novelName = loadedCheerio(this).find('div[class="img-home"] > a').attr('title');
    const novelCover = loadedCheerio(this).find('div[class="img-home"] > a > img')
      .attr('src').replace("-150x150", "");
    const novelUrl = loadedCheerio(this).find('div[class="img-home"] > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });
};

const JaomixScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default JaomixScraper;