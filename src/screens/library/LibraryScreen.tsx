import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { SafeAreaView } from '@components/index';
import LibraryBottomSheet from '@screens/library/components/LibraryBottomSheet/LibraryBottomSheet';
import SetCategoryModal from '@screens/novel/components/SetCategoriesModal';

import { useAppSettings } from '@hooks/persisted';
import { useTheme } from '@providers/Providers';
import { useBackHandler, useBoolean } from '@hooks';
import { LibraryScreenProps } from '@navigators/types';
import * as DocumentPicker from 'expo-document-picker';
import ServiceManager from '@services/ServiceManager';
import useImport from '@hooks/persisted/useImport';
import { useLibraryContext } from '@components/Context/LibraryContext';

import { getString } from '@strings/translations';
import LibraryActionBarAndFab from './components/LibraryActionBarAndFab';
import LibraryTabs from './components/LibraryTabs';
import LibraryHeader from './components/LibraryHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LibraryScreen = ({ navigation }: LibraryScreenProps) => {
  const theme = useTheme();
  const { left: leftInset, right: rightInset } = useSafeAreaInsets();
  const bottomSheetStyle = useMemo(
    () => ({ marginLeft: leftInset, marginRight: rightInset }),
    [leftInset, rightInset],
  );

  const {
    library,
    categories,
    refetchLibrary,
    isLoading,
    searchText,
    setSearchText,
    settings: { showNumberOfNovels, downloadedOnlyMode, incognitoMode },
  } = useLibraryContext();

  const clearSearchbar = () => setSearchText('');

  const { importNovel } = useImport();
  const { useLibraryFAB = false } = useAppSettings();

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);

  const [index, setIndex] = useState(0); // For TabView
  const [selectedNovelIds, setSelectedNovelIds] = useState<number[]>([]);

  const {
    value: setCategoryModalVisible,
    setTrue: showSetCategoryModal,
    setFalse: closeSetCategoryModal,
  } = useBoolean();

  const currentNovels = useMemo(() => {
    if (!categories.length) return [];
    const ids = categories[index].novelIds;
    return library.filter(l => ids.includes(l.id));
  }, [categories, index, library]);

  useBackHandler(() => {
    if (selectedNovelIds.length) {
      setSelectedNovelIds([]);
      return true;
    }
    return false;
  });

  useEffect(
    () =>
      navigation.addListener('tabPress', e => {
        if (navigation.isFocused()) {
          e.preventDefault();
          bottomSheetRef.current?.present?.();
        }
      }),
    [navigation],
  );

  // Callbacks for Header
  const onSearchbarLeftIconPress = useCallback(() => {
    if (selectedNovelIds.length > 0) {
      setSelectedNovelIds([]);
    }
  }, [selectedNovelIds.length]);

  const onSelectAllNovels = useCallback(() => {
    setSelectedNovelIds(currentNovels.map(novel => novel.id));
  }, [currentNovels]);

  const onFilterPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const onUpdateLibrary = useCallback(() => {
    ServiceManager.manager.addTask({
      name: 'UPDATE_LIBRARY',
    });
  }, []);

  const onUpdateCategory = useCallback(() => {
    const currentCategory = categories[index];
    if (currentCategory && currentCategory.id !== 2) {
      ServiceManager.manager.addTask({
        name: 'UPDATE_LIBRARY',
        data: {
          categoryId: currentCategory.id,
          categoryName: currentCategory.name,
        },
      });
    }
  }, [categories, index]);

  const pickAndImportCallback = useCallback(() => {
    DocumentPicker.getDocumentAsync({
      type: 'application/epub+zip',
      copyToCacheDirectory: true,
      multiple: true,
    }).then(importNovel);
  }, [importNovel]);

  const openRandom = useCallback(() => {
    const novels = currentNovels;
    const randomNovel = novels[Math.floor(Math.random() * novels.length)];
    if (randomNovel) {
      navigation.navigate('ReaderStack', {
        screen: 'Novel',
        params: randomNovel,
      });
    }
  }, [currentNovels, navigation]);

  return (
    <SafeAreaView excludeBottom>
      <LibraryHeader
        searchText={searchText}
        onClearSearchbar={clearSearchbar}
        searchbarPlaceholder={
          selectedNovelIds.length === 0
            ? getString('libraryScreen.searchbar')
            : `${selectedNovelIds.length} selected`
        }
        onLeftIconPress={onSearchbarLeftIconPress}
        onSearchTextChange={setSearchText}
        selectedNovelIdsLength={selectedNovelIds.length}
        onSelectAll={onSelectAllNovels}
        onFilterPress={onFilterPress}
        onUpdateLibrary={onUpdateLibrary}
        onUpdateCategory={onUpdateCategory}
        onImportEpub={pickAndImportCallback}
        onOpenRandom={openRandom}
        downloadedOnlyMode={downloadedOnlyMode}
        incognitoMode={incognitoMode}
        theme={theme}
      />

      <LibraryTabs
        categories={categories}
        index={index}
        setIndex={setIndex}
        showNumberOfNovels={showNumberOfNovels}
        library={library}
        searchText={searchText}
        isLoading={isLoading}
        selectedNovelIds={selectedNovelIds}
        setSelectedNovelIds={setSelectedNovelIds}
        pickAndImport={pickAndImportCallback}
        navigation={navigation}
        theme={theme}
      />

      <SetCategoryModal
        novelIds={selectedNovelIds}
        closeModal={closeSetCategoryModal}
        onEditCategories={() => setSelectedNovelIds([])}
        visible={setCategoryModalVisible}
        onSuccess={() => {
          setSelectedNovelIds([]);
          refetchLibrary();
        }}
      />
      <LibraryBottomSheet
        bottomSheetRef={bottomSheetRef}
        style={bottomSheetStyle}
      />
      <LibraryActionBarAndFab
        selectedNovelIds={selectedNovelIds}
        setSelectedNovelIds={setSelectedNovelIds}
        showSetCategoryModal={showSetCategoryModal}
        refetchLibrary={refetchLibrary}
        useLibraryFAB={useLibraryFAB}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default React.memo(LibraryScreen);
