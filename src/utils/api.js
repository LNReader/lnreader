export const getNovelDetails = (extensionId, novelUrl) => {
    const url = `https://lnreader-extensions.herokuapp.com/api/${extensionId}/novel/${novelUrl}`;

    return fetch(url)
        .then((response) => response.json())
        .then((json) => {
            let novel = {
                novelSummary: json.novelSummary,
                "Author(s)": json["Author(s)"],
                "Genre(s)": json["Genre(s)"],
                Status: json.Status,
                sourceUrl: json.sourceUrl,
                source: json.sourceName,
                unread: 1,
                lastRead: json.novelChapters[0].chapterUrl,
                lastReadName: json.novelChapters[0].chapterName,
            };

            let chapters = json.novelChapters;

            return { novel, chapters };
        })
        .catch((error) => console.error(error));
};
