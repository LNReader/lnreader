import React, { useMemo } from 'react';
import { SearchbarV2 } from '@components/index';
import { Banner } from './Banner';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { RightIcon } from '@components/SearchbarV2/SearchbarV2';

interface LibraryHeaderProps {
  searchText: string;
  onClearSearchbar: () => void;
  searchbarPlaceholder: string;
  onLeftIconPress: () => void;
  onSearchTextChange: (text: string) => void;
  selectedNovelIdsLength: number;
  onSelectAll: () => void;
  onFilterPress: () => void;
  onUpdateLibrary: () => void;
  onUpdateCategory: () => void;
  onImportEpub: () => void;
  onOpenRandom: () => void;
  downloadedOnlyMode?: boolean;
  incognitoMode?: boolean;
  theme: ThemeColors;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchText,
  onClearSearchbar,
  searchbarPlaceholder,
  onLeftIconPress,
  onSearchTextChange,
  selectedNovelIdsLength,
  onSelectAll,
  onFilterPress,
  onUpdateLibrary,
  onUpdateCategory,
  onImportEpub,
  onOpenRandom,
  downloadedOnlyMode,
  incognitoMode,
  theme,
}) => {
  const searchbarRightIcons = useMemo<RightIcon[]>(
    () =>
      selectedNovelIdsLength
        ? [{ iconName: 'select-all', onPress: onSelectAll }]
        : [{ iconName: 'filter-variant', onPress: onFilterPress }],
    [selectedNovelIdsLength, onSelectAll, onFilterPress],
  );

  const searchbarMenuButtons = useMemo(
    () => [
      {
        title: getString('libraryScreen.extraMenu.updateLibrary'),
        onPress: onUpdateLibrary,
      },
      {
        title: getString('libraryScreen.extraMenu.updateCategory'),
        onPress: onUpdateCategory,
      },
      {
        title: getString('libraryScreen.extraMenu.importEpub'),
        onPress: onImportEpub,
      },
      {
        title: getString('libraryScreen.extraMenu.openRandom'),
        onPress: onOpenRandom,
      },
    ],
    [onUpdateLibrary, onUpdateCategory, onImportEpub, onOpenRandom],
  );

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={onClearSearchbar}
        placeholder={searchbarPlaceholder}
        onLeftIconPress={onLeftIconPress}
        onChangeText={onSearchTextChange}
        leftIcon={selectedNovelIdsLength ? 'close' : 'magnify'}
        rightIcons={searchbarRightIcons}
        menuButtons={searchbarMenuButtons}
        theme={theme}
      />
      {downloadedOnlyMode ? (
        <Banner
          icon="cloud-off-outline"
          label={getString('moreScreen.downloadOnly')}
          theme={theme}
        />
      ) : null}
      {incognitoMode ? (
        <Banner
          icon="incognito"
          label={getString('moreScreen.incognitoMode')}
          theme={theme}
          backgroundColor={theme.tertiary}
          textColor={theme.onTertiary}
        />
      ) : null}
    </>
  );
};

export default React.memo(LibraryHeader);
