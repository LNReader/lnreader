import { getSource } from "../../sources/sources";

export const fetchSources = async () => {
    const url = `https://lnreader-extensions.vercel.app/api/`;

    let res = await fetch(url);
    let sources = await res.json();

    return sources;
};

export const fetchNovel = async (sourceId, novelUrl) => {
    const source = getSource(sourceId);

    const res = await source.parseNovelAndChapters(novelUrl);

    const novel = {
        novelUrl: res.novelUrl,
        sourceUrl: res.url,
        source: res.sourceName,
        sourceId: res.sourceId,
        novelName: res.novelName,
        novelCover: res.novelCover,
        novelSummary: res.summary,
        author: res.author,
        artist: res.artist,
        status: res.status,
        genre: res.genre,
        followed: 0,
        chapters: res.chapters,
    };

    // console.log(novel);

    return novel;
};

export const fetchChapter = async (sourceId, novelUrl, chapterUrl) => {
    const source = getSource(sourceId);

    let chapter = await source.parseChapter(novelUrl, chapterUrl);

    return chapter;
};

export const fetchChapters = async (sourceId, novelUrl) => {
    const url = `https://lnreader-extensions.vercel.app/api/${sourceId}/novel/${novelUrl}`;

    let data = await fetch(url);
    let res = await data.json();

    const chapters = res.novelChapters;

    return chapters;
};
