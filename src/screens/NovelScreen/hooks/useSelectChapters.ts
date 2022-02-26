import {useState} from 'react';
import * as Haptics from 'expo-haptics';
import {ChapterItem} from '../../../database/types';

const useSelectChapters = () => {
  const [selectedChapters, setSelectedChapters] = useState<ChapterItem[]>([]);

  const isSelected = (chapter: ChapterItem) =>
    selectedChapters.some(item => item.chapterId === chapter.chapterId);

  const selectChapter = (chapter: ChapterItem) => {
    if (!isSelected(chapter)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedChapters(prevState => [...prevState, chapter]);
    } else {
      setSelectedChapters(prevState =>
        prevState.filter(item => item.chapterId !== chapter.chapterId),
      );
    }
  };

  const clearSelection = () => setSelectedChapters([]);

  return {
    selectedChapters,
    selectChapter,
    isSelected,
    clearSelection,
    setSelectedChapters,
  };
};

export default useSelectChapters;
