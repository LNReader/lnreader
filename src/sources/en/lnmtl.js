import cheerio from "react-native-cheerio";
import { showToast } from "../../hooks/showToast";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://lnmtl.com/";

const popularNovels = async (page) => {
    const totalPages = 63;
    let url = baseUrl + "novel?page=" + page;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".media").each(function (result) {
        const novelName = $(this).find("h4").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h4 > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl + "novel/", "");

        const novel = {
            sourceId: 37,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    showToast("LNMTL might take around 20-30 seconds.");

    const url = baseUrl + "novel/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 37;

    novel.sourceName = "LNMTL";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".novel-name").text();

    novel.novelCover = $("div.novel").find("img").attr("src");

    novel.summary = $("div.description").text().trim();

    novel.author = $(
        "main > div:nth-child(3) > div > div.col-lg-3.col-md-4 > div:nth-child(2) > div.panel-body > dl:nth-child(1) > dd > span"
    ).text();

    novel.status = $(
        "main > div:nth-child(3) > div > div.col-lg-3.col-md-4 > div:nth-child(2) > div.panel-body > dl:nth-child(2) > dd"
    )
        .text()
        .trim();

    novel.genre = $(
        "main > div.container > div > div.col-lg-3.col-md-4 > div:nth-child(4) > div.panel-body > ul"
    )
        .text()
        .trim()
        .replace(/\s\s/g, ",");

    let volumes = JSON.parse(
        $("main")
            .next()
            .html()
            .match(/lnmtl.volumes = \[(.*?)\]/)[0]
            .replace("lnmtl.volumes = ", "")
    );

    let chapters = [];

    volumes = volumes.map((volume) => volume.id);

    for (const volume of volumes) {
        let volumeData = await fetch(
            `https://lnmtl.com/chapter?page=1&volumeId=${volume}`
        );
        volumeData = await volumeData.json();

        // volumeData = volumeData.data.map((volume) => volume.slug);

        for (let i = 1; i <= volumeData.last_page; i++) {
            let chapterData = await fetch(
                `https://lnmtl.com/chapter?page=${i}&volumeId=${volume}`
            );
            chapterData = await chapterData.json();

            chapterData = chapterData.data.map((chapter) => ({
                chapterName: `#${chapter.number} ${chapter.title}`,
                chapterUrl: chapter.slug,
                releaseDate: chapter.created_at,
            }));

            chapters.push(...chapterData);
        }
    }

    novel.chapters = chapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}chapter/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h3 > span.chapter-title").text().trim();

    $(".original").remove();

    let chapterText = $(".chapter-body").html();

    if (!chapterText) {
        chapterText = $(".alert.alert-warning").text();
    }

    chapterText =
        chapterName +
        "\n\n" +
        htmlToText(chapterText, { removeLineBreaks: false });

    const chapter = {
        sourceId: 37,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = "https://lnmtl.com/term";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = $("footer")
        .next()
        .next()
        .html()
        .match(/local: \[(.*?)\]/)[0]
        .replace("local: ", "");

    novels = JSON.parse(novels);

    novels = novels.filter((novel) =>
        novel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    novels = novels.map((novel) => ({
        sourceId: 37,
        novelName: novel.name,
        novelUrl: novel.slug,
        novelCover: novel.image,
    }));

    return novels;
};

const LNMTLScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default LNMTLScraper;
