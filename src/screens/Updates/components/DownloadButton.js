import React from "react";

import { Menu } from "react-native-paper";
import {
    ChapterDownloadingButton,
    DeleteChapterButton,
    DownloadChapterButton,
} from "../../Novel/components/Chapter/ChapterDownloadButtons";

export const DownloadButton = ({
    downloadQueue,
    theme,
    chapter,
    downloadChapter,
    deleteChapter,
    deleteChapterMenu,
    showDeleteChapterMenu,
    hideDeleteChapterMenu,
}) => {
    if (downloadQueue.some((chap) => chap.chapterId === chapter.chapterId)) {
        return <ChapterDownloadingButton theme={theme} />;
    } else if (chapter.downloaded === 1) {
        return (
            <Menu
                visible={deleteChapterMenu}
                onDismiss={hideDeleteChapterMenu}
                anchor={
                    <DeleteChapterButton
                        theme={theme}
                        onPress={showDeleteChapterMenu}
                    />
                }
                contentStyle={{ backgroundColor: theme.menuColor }}
            >
                <Menu.Item
                    onPress={() =>
                        deleteChapter(chapter.chapterId, chapter.chapterName)
                    }
                    title="Delete"
                    titleStyle={{ color: theme.textColorPrimary }}
                />
            </Menu>
        );
    } else {
        return (
            <DownloadChapterButton
                theme={theme}
                onPress={() =>
                    downloadChapter(
                        chapter.sourceId,
                        chapter.novelUrl,
                        chapter.chapterUrl,
                        chapter.chapterName,
                        chapter.chapterId
                    )
                }
            />
        );
    }
};
