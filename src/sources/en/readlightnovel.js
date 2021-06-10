import cheerio from "react-native-cheerio";

const sourceId = 2;

const sourceName = "ReadLightNovel";

const lang = "en";

const baseUrl = "https://www.readlightnovel.org";

const searchUrl = "https://www.readlightnovel.org/detailed-search";

const popularNovels = async (page) => {
    const url = `${baseUrl}/top-novel/${page}`;

    const result = await fetch(url);
    const body = await result.text();

    const $ = cheerio.load(body);

    const novels = [];

    $(".top-novel-block").each(function (result) {
        const novelName = $(this).find("h2 > a").text();
        const novelCover = $(this).find("img").attr("src");
        const novelUrl = $(this)
            .find("h2 > a")
            .attr("href")
            .replace(`${baseUrl}/`, "");

        const novel = {
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel;

    const novelName = $(".block-title > h1").text();

    const novelCover = $(".novel-cover > a > img").attr("src");

    let author, artist, genre, summary;

    $(".novel-detail-item").each(function (result) {
        const detailName = $(this).find(".novel-detail-header > h6").text();
        const detail = $(this).find(".novel-detail-body").text();

        switch (detailName) {
            case "Genre":
                genre = detail.replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                author = detail.trim();
                break;
            case "Artist(s)":
                artist = detail.trim();
                break;
            case "Description":
                summary = detail;
                break;
        }
    });

    let chapters = [];

    $(".panel").each(function (res) {
        let volumeName = $(this).find("h4.panel-title").text();

        $(this)
            .find("ul.chapter-chs > li")
            .each(function (result) {
                let chapterName = $(this).find("a").text();

                const releaseDate = null;

                const chapterUrl = $(this)
                    .find("a")
                    .attr("href")
                    .replace(`${baseUrl}/${novelUrl}/`, "");

                if (volumeName.includes("Volume")) {
                    chapterName = volumeName + " " + chapterName;
                }

                const chapter = {
                    chapterName,
                    releaseDate,
                    chapterUrl,
                };

                chapters.push(chapter);
            });
    });

    novel = {
        sourceId,
        sourceName,
        url,
        novelName,
        novelCover,
        genre,
        author,
        artist,
        summary,
        chapters,
    };

    return novel;
};

export { popularNovels, parseNovelAndChapters };
