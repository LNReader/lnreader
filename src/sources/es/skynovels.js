import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.skynovels.net/";

const popularNovels = async (page) => {
    let totalPages = 1;
    const url = "https://api.skynovels.net/api/novels?&q";

    const result = await fetch(url);
    const body = await result.json();

    const novels = [];

    body.novels.map((res) => {
        const novelName = res.nvl_title;
        const novelCover =
            "https://api.skynovels.net/api/get-image/" +
            res.image +
            "/novels/false";
        const novelUrl = res.id + "/" + res.nvl_name + "/";

        const novel = { sourceId: 24, novelName, novelUrl, novelCover };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novUrl) => {
    let novelId = novUrl.split("/")[0];
    let novelUrl = novUrl[1];
    const url =
        "https://api.skynovels.net/api/novel/" + novelId + "/reading?&q";

    const result = await fetch(url);
    const body = await result.json();

    const item = body.novel[0];

    let novel = {};

    novel.sourceId = 24;

    novel.sourceName = "SkyNovels";

    novel.url = baseUrl + "novelas/" + novelId + "/" + novelUrl;

    novel.novelUrl = novUrl;

    novel.novelName = item.nvl_title;

    novel.novelCover =
        "https://api.skynovels.net/api/get-image/" +
        item.image +
        "/novels/false";

    let genres = [];
    item.genres.map((genre) => genres.push(genre.genre_name));
    novel.genre = genres.join(",");
    novel.author = item.nvl_writer;
    novel.summary = item.nvl_content;
    novel.status = item.nvl_status;

    let novelChapters = [];

    item.volumes.map((volume) => {
        volume.chapters.map((chapter) => {
            const chapterName = chapter.chp_index_title;
            const releaseDate = new Date(chapter.createdAt).toDateString();
            const chapterUrl = chapter.id + "/" + chapter.chp_name;

            const chap = { chapterName, releaseDate, chapterUrl };

            novelChapters.push(chap);
        });
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novUrl, chapUrl) => {
    let novelId = novUrl.split("/")[0];
    let novelUrl = novUrl[1];
    let chapterId = chapUrl.split("/")[0];
    let chapterUrl = chapUrl[1];
    const url = `https://api.skynovels.net/api/novel-chapter/${chapterId}`;

    const result = await fetch(url);
    const body = await result.json();

    const item = body.chapter[0];

    let chapterName = item.chp_index_title;

    let chapterText = htmlToText(item.chp_content);

    novelUrl = novelId + "/" + novelUrl + "/";
    chapterUrl = item.id + "/" + item.chp_name;

    const chapter = {
        sourceId: 24,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    searchTerm = searchTerm.toLowerCase();
    const url = "https://api.skynovels.net/api/novels?&q";

    const result = await fetch(url);
    const body = await result.json();

    let results = body.novels.filter((novel) =>
        novel.nvl_title.toLowerCase().includes(searchTerm)
    );

    const novels = [];

    results.map((res) => {
        const novelName = res.nvl_title;
        const novelCover =
            "https://api.skynovels.net/api/get-image/" +
            res.image +
            "/novels/false";
        const novelUrl = res.id + "/" + res.nvl_name + "/";

        const novel = { sourceId: 24, novelName, novelUrl, novelCover };

        novels.push(novel);
    });

    return novels;
};

const SkyNovelsScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default SkyNovelsScraper;
