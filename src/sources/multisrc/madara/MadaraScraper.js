import cheerio from "react-native-cheerio";
import { Status } from "../../helpers/constants";
import { htmlToText } from "../../helpers/htmlToText";
import { parseMadaraDate } from "../../helpers/parseDate";

class MadaraScraper {
    constructor(sourceId, baseUrl, sourceName, path) {
        this.sourceId = sourceId;
        this.baseUrl = baseUrl;
        this.sourceName = sourceName;
        this.path = path;
    }

    async popularNovels(page) {
        const totalPages = 100;
        let url =
            this.baseUrl +
            this.path.novels +
            "/page/" +
            page +
            "/?m_orderby=rating";
        let sourceId = this.sourceId;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let novels = [];

        $(".manga-title-badges").remove();

        $(".page-item-detail").each(function () {
            const novelName = $(this).find(".post-title").text().trim();
            let image = $(this).find("img");
            const novelCover = image.attr("data-src") || image.attr("src");

            let novelUrl = $(this)
                .find(".post-title")
                .find("a")
                .attr("href")
                .split("/")[4];

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
        const url = `${this.baseUrl}${this.path.novel}/${novelUrl}/`;

        const result = await fetch(url);
        const body = await result.text();

        let $ = cheerio.load(body);

        let novel = {};

        novel.sourceId = this.sourceId;

        novel.sourceName = this.sourceName;

        novel.url = url;

        novel.novelUrl = novelUrl;

        $(".manga-title-badges").remove();

        novel.novelName = $(".post-title > h1").text().trim();

        novel.novelCover =
            $(".summary_image > a > img").attr("data-src") ||
            $(".summary_image > a > img").attr("src") ||
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.png?raw=true";

        $(".post-content_item").each(function () {
            const detailName = $(this)
                .find(".summary-heading > h5")
                .text()
                .trim();
            const detail = $(this).find(".summary-content").text().trim();

            switch (detailName) {
                case "Genre(s)":
                    novel.genre = detail.replace(/[\t\n]/g, ",");
                    break;
                case "Author(s)":
                    novel.author = detail;
                    break;
                case "Status":
                    novel.status = detail.includes("OnGoing")
                        ? Status.ONGOING
                        : Status.COMPLETED;
                    break;
            }
        });

        novel.summary = $("div.summary__content").text().trim();

        let novelChapters = [];

        const novelId =
            $(".rating-post-id").attr("value") ||
            $("#manga-chapters-holder").attr("data-id");

        let formData = new FormData();
        formData.append("action", "manga_get_chapters");
        formData.append("manga", novelId);

        const data = await fetch(this.baseUrl + "wp-admin/admin-ajax.php", {
            method: "POST",
            body: formData,
        });
        const text = await data.text();

        if (text !== "0") {
            $ = cheerio.load(text);
        }

        $(".wp-manga-chapter").each(function () {
            const chapterName = $(this)
                .find("a")
                .text()
                .replace(/[\t\n]/g, "")
                .trim();

            let releaseDate = $(this)
                .find("span.chapter-release-date")
                .text()
                .trim();

            if (releaseDate) {
                releaseDate = parseMadaraDate(releaseDate);
            }

            const chapterUrl = $(this).find("a").attr("href").split("/")[5];

            novelChapters.push({ chapterName, releaseDate, chapterUrl });
        });

        novel.chapters = novelChapters.reverse();

        return novel;
    }

    async parseChapter(novelUrl, chapterUrl) {
        let sourceId = this.sourceId;

        const url = `${this.baseUrl}${this.path.chapter}/${novelUrl}/${chapterUrl}`;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let chapterName =
            $(".text-center").text() || $("#chapter-heading").text();

        let chapterText = $(".text-left").html();
        chapterText = htmlToText(chapterText);

        const chapter = {
            sourceId,
            novelUrl,
            chapterUrl,
            chapterName,
            chapterText,
        };

        return chapter;
    }

    async searchNovels(searchTerm) {
        const url = `${this.baseUrl}?s=${searchTerm}&post_type=wp-manga`;

        const result = await fetch(url);
        const body = await result.text();

        const $ = cheerio.load(body);

        let novels = [];
        let sourceId = this.sourceId;

        $(".c-tabs-item__content").each(function () {
            const novelName = $(this).find(".post-title").text().trim();

            let image = $(this).find("img");
            const novelCover = image.attr("data-src") || image.attr("src");

            let novelUrl = $(this)
                .find(".post-title")
                .find("a")
                .attr("href")
                .split("/")[4];

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

export default MadaraScraper;
