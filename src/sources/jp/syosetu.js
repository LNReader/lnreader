import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";
import moment from "moment";

const baseUrl = "https://syosetu.com"; // base url for syosetu.com

// get given page of search (if pagenum is 0 or >100 (max possible on site) see first page)
const searchUrl = (pagenum, order) => {
    return `https://yomou.syosetu.com/search.php?order=${order || "hyoka"}${
        !isNaN((pagenum = parseInt(pagenum))) // check if pagenum is a number
            ? `&p=${pagenum <= 1 || pagenum > 100 ? "1" : pagenum}` // check if pagenum is between 1 and 100
            : "" // if isn't don't set ?p
    }`;
};

// get the Syosetu ID of the chapter
const getLastPartOfUrl = (url) =>
    (ex = /.*(?=\/)(.{2,})$/.exec(url)) ? ex[1].replace(/\//g, "") : null;

// get novelUrl from Syosetu ID
const getNovelUrl = (id) => `https://ncode.syosetu.com/${id}`;

// get chapterUrl from Syosetu ID and chapter ID
const getChapterUrl = (id, chn) =>
    `https://ncode.syosetu.com/${id}${chn === "oneshot" ? "" : `/${chn}`}`;

// Because syosetu does not have any covers, I did a replacement for them
const novelCover =
    "https://raw.githubusercontent.com/skillgg/lnreader-sources/main/src/jp/syosetu/not_found.png";

// ID of this extension
const sourceId = 36;

// Name of this extension
const sourceName = "Syosetu";

// there are 20 mangas per page
// this is number of pages loaded in the first "batch" of loads
// TOOD: in-app dynamic loading on scroll
const maxPageLoad = 3;

const popularNovels = async (page) => {
    const totalPages = 3;
    // array of all the novels
    let novels = [];
    // returns list of novels from given page
    let getNovelsFromPage = async (pagenumber) => {
        // load page
        const result = await fetch(searchUrl(pagenumber || null));
        const body = await result.text();
        // Cheerio it!
        const cheerioQuery = cheerio.load(body, { decodeEntities: false });


        let pageNovels = [];
        // find class=searchkekka_box
        cheerioQuery(".searchkekka_box").each(function (i, e) {
            // get div with link and name
            const novelDIV = cheerioQuery(this).find(".novel_h");
            // get link element
            const novelA = novelDIV.children()[0];
            // add new novel to array
            pageNovels.push({
                novelName: novelDIV.text(), // get the name
                novelUrl: getLastPartOfUrl(novelA.attribs.href), // get last part of the link
                sourceId,
                novelCover, // TODO: IDK what to do about covers... On Syo they don't have them
            });
        });
        // return all novels from this page
        return pageNovels;
    };

    novels = await getNovelsFromPage(page);
    /** Use
     * novels.push(...(await getNovelsFromPage(pageNumber)))
     * if you want to load more
     */

    // respond with novels!
    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = getNovelUrl(novelUrl);

    let chapters = [];

    const result = await fetch(url);
    const body = await result.text();
    const cheerioQuery = cheerio.load(body, { decodeEntities: false });

    // create novel object
    let novel = {
        sourceId,
        sourceName,
        url: url,
        novelUrl,
        novelName: cheerioQuery(".novel_title").text(),
        author: cheerioQuery(".novel_writername").text().replace("作者：", ""),
        novelCover,
    };

    // Get all the chapters
    const cqGetChapters = cheerioQuery(".novel_sublist2");
    if (cqGetChapters.length !== 0) {
        // has more than 1 chapter
        novel.summary = cheerioQuery("#novel_ex")
            .text()
            .replace(/<\s*br.*?>/g, "\n");
        cqGetChapters.each(function (i, e) {
            const chapterA = cheerioQuery(this).find("a");
            const [chapterName, releaseDate, chapterUrl] = [
                // set the variables
                chapterA.text(),
                cheerioQuery(this)
                    .find("dt") // get title
                    .text() // get text
                    .replace(/（.）/g, "") // remove "(edited)" mark
                    .trim(), // trim spaces
                getLastPartOfUrl(chapterA.attr("href")),
            ];
            chapters.push({ chapterName, releaseDate, chapterUrl });
        });
    } else {
        /**
         * Because there are oneshots on the site, they have to be treated with special care
         * that's what pisses me off in Shosetsu app. They have this extension,
         * but every oneshot is set as "there are no chapters" and all contents are thrown into the description!!
         */
        // get summary for oneshot chapter

        const result = await fetch(searchUrl() + `&word=${novel.novelName}`);
        const body = await result.text();
        const summaryQuery = cheerio.load(body, {decodeEntities:false});
        const foundText = summaryQuery(".searchkekka_box").first().find(".ex").text().replace(/\s{2,}/g,"\n");
        novel.summary = foundText;

        // add single chapter
        chapters.push({
            chapterName: novel.novelName,
            releaseDate: cheerioQuery("head")
                .find("meta[name='WWWC']")
                .attr("content"), // get date from metadata
            chapterUrl: "oneshot", // set chapterUrl to oneshot so that chapterScraper knows it's a one-shot
        });
    }
    novel.chapters = chapters;

    return novel;
};

let parseChapter = async (novelUrl, chapterUrl) => {
    const url = getChapterUrl(novelUrl, chapterUrl); // get Url

    const result = await fetch(url);
    const body = await result.text();

    // create cheerioQuery
    const cheerioQuery = cheerio.load(body, {
        decodeEntities: false,
    });

    let chapterText = cheerioQuery("#novel_honbun") // get chapter text
        .html();
    chapterText = htmlToText(chapterText);

    // create chapter data structure
    let chapter = {
        sourceId: 36,
        novelUrl,
        chapterUrl,
        chapterName: "",
        chapterText,
        nextChapter: null,
        prevChapter: null,
    };

    if (chapterUrl === "oneshot")
        // oneshot get name
        chapter.chapterName = cheerioQuery("#novel_title").text();
    else {
        // single chapter

        // get name
        chapter.chapterName = cheerioQuery(".novel_subtitle").first().text();

        // get next/prev buttons
        const chapterButtons = cheerioQuery(
            "#novel_contents .novel_bn"
        ).first();
        if (chapterButtons.length === 1) {
            const button = chapterButtons.find("a");
            if (button.text().match(/次/))
                chapter.nextChapter = getLastPartOfUrl(button.attr("href"));
            else chapter.prevChapter = getLastPartOfUrl(button.attr("href"));
        } else {
            const firstButton = chapterButtons.find("a").first();
            const lastButton = chapterButtons.find("a").last();
            chapter.prevChapter = getLastPartOfUrl(firstButton.attribs.href);
            chapter.nextChapter = getLastPartOfUrl(lastButton.attribs.href);
        }
    }

    return chapter;
};

let searchNovels = async (searchTerm) => {
    // const orderBy = req.query.o;

    // array of all the novels
    let novels = [];

    let isNext = true;

    // returns list of novels from given page
    let getNovelsFromPage = async (pagenumber) => {
        // load page
        const result = await fetch(
            searchUrl(pagenumber || null, null) + `&word=${searchTerm}`
        );
        const body = await result.text();
        // Cheerio it!
        const cheerioQuery = cheerio.load(body, { decodeEntities: false });

        if (cheerioQuery(".nextlink").length === 0) isNext = false;

        let pageNovels = [];
        // find class=searchkekka_box
        cheerioQuery(".searchkekka_box").each(function (i, e) {
            // get div with link and name
            const novelDIV = cheerioQuery(this).find(".novel_h");
            // get link element
            const novelA = novelDIV.children()[0];
            // add new novel to array
            pageNovels.push({
                novelName: novelDIV.text(), // get the name
                novelUrl: getLastPartOfUrl(novelA.attribs.href), // get last part of the link
                sourceId,
                novelCover, // TODO: IDK what to do about covers... On Syo they don't have them
            });
        });
        // return all novels from this page
        return pageNovels;
    };

    // counter of loaded pages
    // let pagesLoaded = 0;
    // do {
    //     // always load first one
    //     novels.push(...(await getNovelsFromPage(pagesLoaded + 1)));
    //     pagesLoaded++;
    // } while (pagesLoaded < maxPageLoad && isNext); // check if we should load more

    novels = await getNovelsFromPage(1);

    /** Use
     * novels.push(...(await getNovelsFromPage(pageNumber)))
     * if you want to load more
     */

    // respond with novels!
    return novels;
};

const SyosetuScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default SyosetuScraper;
