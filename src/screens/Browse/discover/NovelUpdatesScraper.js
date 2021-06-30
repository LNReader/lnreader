import cheerio from "react-native-cheerio";

const scrapeTopNovels = async (pageNo) => {
    const url =
        "https://www.novelupdates.com/series-ranking/?rank=sixmonths&pg=" +
        pageNo;

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const res = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await res.text();

    const $ = cheerio.load(body);

    const novels = [];

    $("div.search_main_box_nu").each(function (res) {
        const novelCover = $(this).find("img").attr("src");
        const novelName = $(this).find(".search_title > a").text();

        const genres = $(this)
            .find(".search_genre")
            .text()
            .replace(/\s/g, ", ");

        const novelSummary =
            $(this).find(".search_genre")[0].nextSibling.nodeValue;

        let chapterCount = "";

        $(this)
            .find(".search_stats > span")
            .each(function () {
                let detail = $(this).text();

                if (detail.includes("Chapters")) {
                    chapterCount = detail.replace(" Chapters", "");
                }
            });

        // const chapterCount = $(this)
        //     .find('i[title="Chapter Count"]')
        // const updateFrequency = $(this)
        //     .find('i[title="Updates Frequency"]')

        const novel = {
            novelName,
            novelCover,
            genres,
            novelSummary,
            chapterCount,
            // updateFrequency,
        };

        novels.push(novel);
    });

    return novels;
};

const scrapeSearchResults = async (searchTerm) => {
    const url =
        "https://www.novelupdates.com/?s=" +
        searchTerm +
        "&post_type=seriesplans";

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const res = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await res.text();

    const $ = cheerio.load(body);

    const novels = [];

    $("div.search_main_box_nu").each(function (res) {
        const novelCover = $(this).find("img").attr("src");
        const novelName = $(this).find(".search_title > a").text();

        const genres = $(this)
            .find(".search_genre")
            .text()
            .replace(/\s/g, ", ");

        const novelSummary =
            $(this).find(".search_genre")[0].nextSibling.nodeValue;

        const novel = { novelName, novelCover, genres, novelSummary };

        novels.push(novel);
    });

    return novels;
};

export { scrapeTopNovels, scrapeSearchResults };
