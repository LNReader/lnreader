import cheerio from "react-native-cheerio";
import { htmlToText } from "../../helpers/htmlToText";

class WPMangaStreamScraper {
    constructor(sourceId, baseUrl, sourceName) {
        this.sourceId = sourceId;
        this.baseUrl = baseUrl;
        this.sourceName = sourceName;
    }

    async popularNovels(page) {
        let totalPages = 100;
        let url = this.baseUrl + "series/?page=" + page + "?m_orderby=popular";
        let sourceId = this.sourceId;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let novels = [];

        $("article.bs").each(function () {
            const novelName = $(this).find(".ntitle").text().trim();
            let image = $(this).find("img");
            const novelCover = image.attr("src");

            let novelUrl = $(this).find("a").attr("href").split("/")[4];

            const novel = {
                sourceId,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

        return { totalPages, novels };
    }

    async parseNovelAndChapters(novelUrl) {
        const url = `${this.baseUrl}series/${novelUrl}/`;

        const result = await fetch(url);
        const body = await result.text();

        let $ = cheerio.load(body);

        let novel = {};

        novel.sourceId = this.sourceId;

        novel.sourceName = this.sourceName;

        novel.url = url;

        novel.novelUrl = novelUrl;

        novel.novelName = $(".entry-title").text();

        novel.novelCover = $("img.wp-post-image").attr("src");

        $("div.spe > span").each(function () {
            const detailName = $(this).find("b").text().trim();
            const detail = $(this).find("b").next().text().trim();

            if ($(this).text().includes("الحالة:")) {
                novel.status = $(this).text().replace("الحالة: ", "");
            }

            switch (detailName) {
                case "المؤلف:":
                    novel.auhtor = detail;
                    break;
            }
        });

        novel.genre = $(".genxed").text().replace(/\s/g, ",");

        novel.summary = $('div[itemprop="description"]').text().trim();

        let novelChapters = [];

        $(".eplister")
            .find("li")
            .each(function () {
                const chapterName =
                    $(this).find(".epl-num").text() +
                    " - " +
                    $(this).find(".epl-title").text();

                const releaseDate = $(this).find(".epl-date").text().trim();

                const chapterUrl = $(this).find("a").attr("href").split("/")[3];

                novelChapters.push({ chapterName, releaseDate, chapterUrl });
            });

        novel.chapters = novelChapters.reverse();

        return novel;
    }

    async parseChapter(novelUrl, chapterUrl) {
        let sourceId = this.sourceId;

        const url = `${this.baseUrl}${chapterUrl}`;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let chapterName = $(".entry-title").text();

        let chapterText = $("div.epcontent").text();

        if (chapterText) {
            chapterText = htmlToText(chapterText);
        }

        let nextChapter = null;
        let prevChapter = null;

        const chapter = {
            sourceId,
            novelUrl,
            chapterUrl,
            chapterName,
            chapterText,
            nextChapter,
            prevChapter,
        };

        // console.log(chapter);

        return chapter;
    }

    async searchNovels(searchTerm) {
        const url = `${this.baseUrl}?s=${searchTerm}`;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let novels = [];
        let sourceId = this.sourceId;

        $("article.bs").each(function () {
            const novelName = $(this).find(".ntitle").text().trim();
            let image = $(this).find("img");
            const novelCover = image.attr("src");

            let novelUrl = $(this).find("a").attr("href").split("/")[4];

            const novel = {
                sourceId,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

        return novels;
    }
}

module.exports = WPMangaStreamScraper;
