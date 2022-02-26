import {useState} from 'react';
import * as Haptics from 'expo-haptics';

const useSelectNovels = () => {
  const [selectedNovels, setSelectedNovels] = useState<number[]>([]);

  const selectNovel = (novelId: number) => {
    if (selectedNovels.indexOf(novelId) === -1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedNovels(prevState => [...prevState, novelId]);
    } else {
      setSelectedNovels(prevState => prevState.filter(id => id !== novelId));
    }
  };

  const isSelected = (novelId: number) =>
    !Boolean(selectedNovels.indexOf(novelId) === -1);

  const clearSelection = () => setSelectedNovels([]);

  return {selectedNovels, selectNovel, isSelected, clearSelection};
};

export default useSelectNovels;
