import { useCallback, useEffect, useState } from 'react';
import sanitize from 'sanitize-html';
import { defaultTo } from 'lodash-es';
import { getChapterFromDB } from '../database/queries/ChapterQueries';

import { getPlugin } from '@plugins/pluginManager';

import { DownloadedChapter } from '../database/types';
import { ChapterItem } from '@plugins/types';

type Chapter = ChapterItem | DownloadedChapter;

const useChapter = (
  pluginId: string,
  chapterId: number,
  chapterUrl: string,
  novelUrl: string,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chapter, setChapter] = useState<Chapter>();
  const [error, setError] = useState<string>();

  const getChapter = useCallback(async () => {
    try {
      let res: DownloadedChapter = await getChapterFromDB(chapterId);
      let chapterText = '';
      if (!res) {
        chapterText = await getPlugin(pluginId).parseChapter(chapterUrl);
      }

      chapterText = sanitize(
        defaultTo(
          res.chapterText || chapterText,
          "Chapter is empty. Report if it's available in WebView.",
        ),
      );

      setChapter({ ...res, chapterText });
    } catch (err: unknown) {
      if (typeof err === 'string') {
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pluginId, chapterId, chapterUrl, novelUrl]);

  useEffect(() => {
    getChapter();
  }, [getChapter]);

  return { isLoading, setIsLoading, chapter, error };
};

export default useChapter;
