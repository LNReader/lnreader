import cheerio from "react-native-cheerio";

const baseUrl = "https://oasistranslations.wordpress.com/";

const popularNovels = async (page) => {
    let url = baseUrl;

    let totalPages = 1;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".menu-item-1819")
        .find(".sub-menu > li")
        .each(function (result) {
            const novelName = $(this).text();
            if (!novelName.match(/Activas|Finalizadas|Dropeadas/)) {
                const novelCover = $(this).find("img").attr("src");

                let novelUrl = $(this).find("a").attr("href");
                novelUrl = novelUrl.split("/");
                novelUrl = novelUrl[novelUrl.length - 2] + "/";

                const novel = {
                    sourceId: 30,
                    novelName,
                    novelCover,
                    novelUrl,
                };

                novels.push(novel);
            }
        });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + novelUrl + "/";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 30;

    novel.sourceName = "Oasis Translations";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.entry-title")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $('img[loading="lazy"]').attr("src");

    $(".entry-content > p").each(function (res) {
        if ($(this).text().includes("Autor")) {
            let details = $(this).html();
            details = details.match(/<\/strong>(.|\n)*?<br>/g);
            details = details.map((detail) =>
                detail.replace(/<strong>|<\/strong>|<br>|:\s/g, "")
            );

            novel.genre = "";

            novel.author = details[2];
            novel.genre = details[4].replace(/\s|&nbsp;/g, "");
            novel.artist = details[3];
        }
    });

    // let novelSummary = $(this).next().html();
    novel.summary = "";

    let novelChapters = [];

    // if ($(".entry-content").find("li").length) {
    $(".entry-content")
        .find("a")
        .each(function (result) {
            let chapterUrl = $(this).attr("href");

            if (chapterUrl && chapterUrl.includes(baseUrl)) {
                const chapterName = $(this).text();
                const releaseDate = null;

                chapterUrl = chapterUrl.split("/");
                chapterUrl = chapterUrl[chapterUrl.length - 2] + "/";

                const chapter = { chapterName, releaseDate, chapterUrl };

                novelChapters.push(chapter);
            }
        });
    // } else {
    //     $(".entry-content")
    //         .find("p")
    //         .each(function (result) {
    //             let chapterUrl = $(this).find("a").attr("href");

    //             if (chapterUrl && chapterUrl.includes(baseUrl)) {
    //                 const chapterName = $(this).text();
    //                 const releaseDate = null;

    //                 chapterUrl = chapterUrl.split("/");
    //                 chapterUrl = chapterUrl[chapterUrl.length - 2] + "/";

    //                 const chapter = { chapterName, releaseDate, chapterUrl };

    //                 novelChapters.push(chapter);
    //             }
    //         });
    // }

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.entry-title").text();

    $("div#jp-post-flair").remove();

    let chapterText = $(".entry-content").html();
    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl + "/";

    const chapter = {
        sourceId: 30,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    searchTerm = searchTerm.toLowerCase();

    let url = baseUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];
    $(".menu-item-1819")
        .find(".sub-menu > li")
        .each(function (result) {
            const novelName = $(this).text();
            if (!novelName.match(/Activas|Finalizadas|Dropeadas/)) {
                const novelCover = $(this).find("img").attr("src");

                let novelUrl = $(this).find("a").attr("href");
                novelUrl = novelUrl.split("/");
                novelUrl = novelUrl[novelUrl.length - 2] + "/";

                const novel = {
                    sourceId: 30,
                    novelName,
                    novelCover,
                    novelUrl,
                };

                novels.push(novel);
            }
        });

    novels = novels.filter((novel) =>
        novel.novelName.toLowerCase().includes(searchTerm)
    );

    return novels;
};

const OasisTranslationsScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default OasisTranslationsScraper;
