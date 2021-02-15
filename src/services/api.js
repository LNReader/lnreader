/**
 * Fetch novel information from source
 */

export const fetchNovelFromSource = async (extensionId, novelUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}`;

    let data = await fetch(url);

    let res = await data.json();

    const novel = {
        novelUrl: res.novelUrl,
        novelName: res.novelName,
        novelCover: res.novelCover,
        novelSummary: res.novelSummary,
        "Author(s)": res["Author(s)"],
        "Genre(s)": res["Genre(s)"],
        Status: res.Status,
        sourceUrl: res.sourceUrl,
        source: res.sourceName,
        unread: 1,
        lastRead: res.novelChapters[0].chapterUrl,
        lastReadName: res.novelChapters[0].chapterName,
        extensionId: res.extensionId,
    };

    return novel;
};

/**
 * Fetch novel chapters froms source
 */

export const fetchChaptersFromSource = async (extensionId, novelUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}`;

    const data = await fetch(url);
    let res = await data.json();

    const chapters = res.novelChapters;

    return chapters;
};

/**
 * Fetch chapter from source
 */

export const fetchChapterFromSource = async (
    extensionId,
    novelUrl,
    chapterUrl
) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${chapterUrl}`;
    console.log(
        `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${chapterUrl}`
    );

    let res = await fetch(url);
    let chapter = await res.json();

    return chapter;
};
