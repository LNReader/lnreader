export const fetchSources = async () => {
    const url = `https://lnreader-extensions.herokuapp.com/api/`;

    let res = await fetch(url);
    let sources = await res.json();

    return sources;
};

export const fetchNovel = async (sourceId, novelUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${sourceId}/novel/${novelUrl}`;

    let data = await fetch(url);
    let res = await data.json();

    const novel = {
        novelUrl: res.novelUrl,
        sourceUrl: res.sourceUrl,
        source: res.sourceName,
        sourceId: res.extensionId,
        novelName: res.novelName,
        novelCover: res.novelCover,
        novelSummary: res.novelSummary,
        author: res["Author(s)"],
        artist: res["Artist(s)"],
        status: res.Status,
        genre: res["Genre(s)"],
        followed: 0,
        chapters: res.novelChapters,
    };

    return novel;
};

export const fetchChapter = async (sourceId, novelUrl, chapterUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${sourceId}/novel/${novelUrl}${chapterUrl}`;

    console.log(url);

    let res = await fetch(url);
    let chapter = await res.json();

    return chapter;
};
