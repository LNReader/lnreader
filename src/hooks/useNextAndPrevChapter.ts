import { useCallback, useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import {
  getNextChapter,
  getPrevChapter,
} from '../database/queries/ChapterQueries';

import { ChapterItem } from '../database/types';
import { showToast } from '../hooks/showToast';

const useNextAndPrevChapter = (
  sourceId: number,
  novelId: number,
  chapterId: number,
) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const [nextChapter, setNextChapter] = useState<ChapterItem>();
  const [previousChapter, setPreviousChapter] = useState<ChapterItem>();

  const getNextAndPrevChapter = useCallback(async () => {
    try {
      const nextChap = await getNextChapter(novelId, chapterId);
      const prevChap = await getPrevChapter(novelId, chapterId);

      setNextChapter(nextChap);
      setPreviousChapter(prevChap);
    } catch (err: unknown) {
      if (typeof err === 'string') {
        showToast(err);
      } else if (err instanceof Error) {
        showToast(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [novelId, chapterId]);

  useEffect(() => {
    getNextAndPrevChapter();
  }, [getNextAndPrevChapter]);

  const navigateToPrevChapter = () =>
    previousChapter
      ? navigation.dispatch(
          StackActions.replace(
            'ReaderScreen' as never,
            {
              sourceId,
              novelId,
              chapterId: previousChapter?.chapterId,
              chapterUrl: previousChapter?.chapterUrl,
            } as never,
          ),
        )
      : showToast("There's no previous chapter");

  const navigateToNextChapter = () =>
    nextChapter
      ? navigation.dispatch(
          StackActions.replace(
            'ReaderScreen' as never,
            {
              sourceId,
              novelId,
              chapterId: nextChapter?.chapterId,
              chapterUrl: nextChapter?.chapterUrl,
            } as never,
          ),
        )
      : showToast("There's no next chapter");

  return {
    isLoading,
    nextChapter,
    previousChapter,
    navigateToNextChapter,
    navigateToPrevChapter,
  };
};

export default useNextAndPrevChapter;
