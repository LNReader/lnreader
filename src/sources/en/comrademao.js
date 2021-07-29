import cheerio from "react-native-cheerio";

const sourceId = 27;

const sourceName = "Comrade Mao";

const baseUrl = "https://comrademao.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "novel/page/" + page;
    const totalPages = 111;
    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".newbox")
        .find("li")
        .each(function () {
            const novelName = $(this).find("h3").text();
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.replace(baseUrl + "novel/", "");

            const novel = {
                sourceId,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return { novels, totalPages };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "novel/" + novelUrl;
    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 27;

    novel.sourceName = sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".booknav2 > h1").text();

    novel.novelCover = $(".bookimg2 > img").attr("src");

    novel.summary = $(".mybox")
        .find(".tabsnav > div > div.qustime > span")
        .text()
        .trim();

    novel.genre = $(".booknav2 > p:nth-child(2)")
        .text()
        .replace(/Genre(s):|\s/g, "");

    novel.status = $(".booknav2 > p:nth-child(5)")
        .text()
        .replace(/Status:|\s/g, "")
        .trim();

    novel.author = $(".booknav2 > p:nth-child(4)")
        .text()
        .replace(/Publisher:|\s/g, "")
        .trim();

    let novelChapters = [];

    // $(".qustime")
    //     .find("li")
    //     .each(function () {
    //         const releaseDate = $(this).find("small").text();

    //         $(this).find("small").remove();

    //         const chapterName = $(this).find("span").text();
    //         const chapterUrl = $(this).find("a").attr("href").split("/")[5];

    //         novelChapters.push({
    //             chapterName,
    //             chapterUrl,
    //             releaseDate,
    //         });
    //     });

    $("small").remove();

    let chapterUrlPrefix = $(".qustime")
        .find("li")
        .first()
        .find("a")
        .text()
        .split(" ");

    chapterUrlPrefix.pop();

    chapterUrlPrefix = chapterUrlPrefix.join("-").toLowerCase();

    let latestChapter = $(".qustime")
        .find("li")
        .first()
        .find("a")
        .text()
        .replace(/^\D+/g, "");

    for (let i = 1; i <= latestChapter; i++) {
        const chapterName = "Chapter " + i;
        const releaseDate = null;
        const chapterUrl = chapterUrlPrefix + "-" + i + "/";

        const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(chapter);
    }

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}mtl/${novelUrl}/${chapterUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = "";

    let chapterText = $(".txtnav").html();
    const chapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = baseUrl + "?s=" + searchTerm + "&post_type=novel";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".newbox")
        .find("li")
        .each(function () {
            const novelName = $(this).find("h3").text();
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.replace(baseUrl + "novel/", "");

            const novel = {
                sourceId,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return novels;
};

const ComradeMaoScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ComradeMaoScraper;
