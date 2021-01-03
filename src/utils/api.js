export const fetchNovelFromSource = async (extensionId, novelUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}`;

    let data = await fetch(url);

    let res = await data.json();

    let novel = {
        novelSummary: res.novelSummary,
        "Author(s)": res["Author(s)"],
        "Genre(s)": res["Genre(s)"],
        Status: res.Status,
        sourceUrl: res.sourceUrl,
        source: res.sourceName,
        unread: 1,
        lastRead: res.novelChapters[0].chapterUrl,
        lastReadName: res.novelChapters[0].chapterName,
    };

    let chapters = res.novelChapters;

    return { novel, chapters };
};

export const fetchChapterFromSource = async (
    extensionId,
    novelUrl,
    chapterUrl
) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}${chapterUrl}`;

    let res = await fetch(url);
    let chapter = await res.json();

    return chapter;
};
