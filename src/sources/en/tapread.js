import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "http://www.tapread.com";

let headers = new Headers({
    "User-Agent":
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page) => {
    let totalPages = 10;

    let url = baseUrl + "/ajax/category/detail";

    let formData = new FormData();
    formData.append("cateId", "0");
    formData.append("pageNo", page);

    const result = await fetch(url, {
        method: "POST",
        headers: headers,
    });
    const data = await result.json();
    let novels = [];

    data.result.bookList.map((book) => {
        const novelName = book.bookName;
        const novelCover = "http://static.tapread.com" + book.coverUrl;
        let novelUrl = book.bookId + "/";

        const novel = {
            sourceId: 17,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/book/detail/${novelUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 17;

    novel.sourceName = "TapRead";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".book-name").text();

    novel.novelCover = "http:" + $("div.book-img > img").attr("src");

    novel.genre = $("div.book-catalog > span.txt").text();

    novel.status = $("div.book-state > span.txt").text();

    novel.author = $("div.author > span.name").text();

    novel.summary = $("div.content > p.desc").text();

    const getChapters = async (novelId) => {
        const chapterListUrl = "http://www.tapread.com/ajax/book/contents";

        let formData = new FormData();
        formData.append("bookId", novelId);

        const data = await fetch(chapterListUrl, {
            method: "POST",
            body: formData,
        });

        const chapters = await data.json();

        let novelChapters = [];

        chapters.result.chapterList.map((chapter) => {
            let chapterName = chapter.chapterName;
            const releaseDate = chapter.pubTime;
            const chapterUrl = chapter.chapterId.toString();

            if (chapter.lock) {
                chapterName = "🔒 " + chapterName;
            }

            novelChapters.push({
                chapterUrl,
                chapterName,
                releaseDate,
            });
        });

        return novelChapters;
    };

    novel.chapters = await getChapters(novelUrl);

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    let formData = new FormData();
    formData.append("bookId", novelUrl);
    formData.append("chapterId", chapterUrl);

    const url = "http://www.tapread.com/ajax/book/chapter";

    const result = await fetch(url, {
        method: "POST",
        body: formData,
    });
    const body = await result.json();

    const chapterName = body.result.chapterName;
    const chapterText = htmlToText(body.result.content);
    const nextChapter =
        body.result.nextChapterId === 0
            ? null
            : body.result.nextChapterId.toString();
    const prevChapter = body.result.preChapterId.toString();
    novelUrl += "/";

    const chapter = {
        sourceId: 17,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        nextChapter,
        prevChapter,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    let formData = new FormData();
    formData.append("storyType", 1);
    formData.append("pageNo", 1);
    formData.append("searchText", searchTerm);

    const url = "http://www.tapread.com/ajax/search/story";

    const data = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const body = await data.json();

    const novels = [];

    body.result.storyList.map((novel) => {
        const novelName = novel.storyName.replace(
            /<font color="#FFCE2E">|<\/font>/g,
            ""
        );
        const novelUrl = novel.storyId;
        const novelCover = "http://static.tapread.com" + novel.coverUrl;

        novels.push({ sourceId: 17, novelName, novelCover, novelUrl });
    });

    return novels;
};

const tapReadScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default tapReadScraper;
