import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import Bottomsheet from 'rn-sliding-up-panel';
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import color from 'color';

import { LoadingScreenV2, SearchbarV2, Button } from '@components/index';
import { LibraryView } from './components/LibraryListView';
import LibraryBottomSheet from './components/LibraryBottomSheet/LibraryBottomSheet';
import { Banner } from './components/Banner';
import { Actionbar } from '@components/Actionbar/Actionbar';

import { useLibrary } from './hooks/useLibrary';
import { useTheme } from '@hooks/useTheme';
import useSearch from '@hooks/useSearch';
import { getString } from '@strings/translations';
import { Portal } from 'react-native-paper';
import { useLibrarySettings } from '@hooks/useSettings';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '../../database/queries/ChapterQueries';
import { unfollowNovel } from '../../database/queries/NovelQueries';
import SetCategoryModal from '@screens/novel/components/SetCategoriesModal';
import useBoolean from '@hooks/useBoolean';
import { debounce, intersection } from 'lodash';
import { ButtonVariation } from '@components/Button/Button';
import { useBackHandler } from '@hooks/useBackHandler';

type State = NavigationState<{
  key: string;
  title: string;
}>;

const LibraryScreen = () => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const { navigate } = useNavigation();
  const {
    showNumberOfNovels = false,
    downloadedOnlyMode = false,
    incognitoMode = false,
  } = useLibrarySettings();

  const onChangeText = debounce((text: string) => {
    setSearchText(text);
  }, 100);

  const handleClearSearchbar = () => {
    clearSearchbar();
  };

  const { library, refetchLibrary, isLoading } = useLibrary({ searchText });
  const [selectedNovelIds, setSelectedNovelIds] = useState<number[]>([]);

  useBackHandler(() => {
    if (selectedNovelIds.length) {
      setSelectedNovelIds([]);
      return true;
    }

    return false;
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  const bottomSheetRef = useRef<Bottomsheet | null>(null);

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State },
  ) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: theme.primary }}
      style={[
        {
          backgroundColor: theme.surface,
          borderBottomColor: color(theme.isDark ? '#FFFFFF' : '#000000')
            .alpha(0.12)
            .string(),
        },
        styles.tabBar,
      ]}
      renderLabel={({ route, color }) => (
        <Text style={{ color }}>{`${route.title} ${
          showNumberOfNovels ? '(' + (route as any).novels.length + ')' : ''
        }`}</Text>
      )}
      inactiveColor={theme.secondary}
      activeColor={theme.primary}
      pressColor={color(theme.primary).alpha(0.12).rgb().string()}
    />
  );

  const searchbarPlaceholder =
    selectedNovelIds.length === 0
      ? getString('libraryScreen.searchbar')
      : `${selectedNovelIds.length} selected`;

  const {
    value: setCategoryModalVisible,
    setTrue: showSetCategoryModal,
    setFalse: closeSetCategoryModal,
  } = useBoolean();

  const selectedNovelCategoryIds = useMemo(() => {
    let categoryIds: number[][] = [];

    library.map(category =>
      category.novels
        .filter(novel => selectedNovelIds.includes(novel.novelId))
        .map(novel => {
          categoryIds.push(JSON.parse(novel.categoryIds));
        }),
    );

    return intersection(...categoryIds);
  }, [selectedNovelIds]);

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={handleClearSearchbar}
        placeholder={searchbarPlaceholder}
        onLeftIconPress={() => {
          if (selectedNovelIds.length > 0) {
            setSelectedNovelIds([]);
          }
        }}
        onChangeText={onChangeText}
        leftIcon={selectedNovelIds.length ? 'close' : 'magnify'}
        rightIcons={[
          selectedNovelIds.length
            ? {
                iconName: 'select-all',
                onPress: () =>
                  setSelectedNovelIds(
                    library[index].novels.map(novel => novel.novelId),
                  ),
              }
            : {
                iconName: 'filter-variant',
                onPress: () => bottomSheetRef.current?.show(),
              },
        ]}
        theme={theme}
      />
      {downloadedOnlyMode && (
        <Banner
          icon="cloud-off-outline"
          label={getString('settings.downloadedOnly')}
          theme={theme}
        />
      )}
      {incognitoMode && (
        <Banner
          icon="incognito"
          label={getString('settings.icognitoMode')}
          theme={theme}
          backgroundColor={theme.tertiary}
          textColor={theme.onTertiary}
        />
      )}
      <TabView
        lazy
        navigationState={{
          index,
          routes: library.map(category => ({
            key: String(category.id),
            title: category.name,
            ...category,
          })),
        }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) =>
          isLoading ? (
            <LoadingScreenV2 theme={theme} />
          ) : (
            <>
              {searchText ? (
                <Button
                  title={`${getString(
                    'common.searchFor',
                  )} "${searchText}" ${getString('common.globally')}`}
                  theme={theme}
                  variation={ButtonVariation.CLEAR}
                  style={styles.globalSearchBtn}
                  labelStyle={styles.globalSearchBtnLabel}
                  onPress={() =>
                    navigate(
                      'GlobalSearchScreen' as never,
                      {
                        searchText,
                      } as never,
                    )
                  }
                />
              ) : null}
              <LibraryView
                categoryId={route.id}
                novels={route.novels}
                selectedNovelIds={selectedNovelIds}
                setSelectedNovelIds={setSelectedNovelIds}
              />
            </>
          )
        }
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      <SetCategoryModal
        novelId={selectedNovelIds}
        currentCategoryIds={selectedNovelCategoryIds}
        closeModal={closeSetCategoryModal}
        onEditCategories={() => setSelectedNovelIds([])}
        visible={setCategoryModalVisible}
        onSuccess={() => {
          setSelectedNovelIds([]);
          refetchLibrary();
        }}
      />
      <Portal>
        <LibraryBottomSheet bottomSheetRef={bottomSheetRef} />
        <Actionbar
          active={selectedNovelIds.length > 0}
          actions={[
            {
              icon: 'label-outline',
              onPress: showSetCategoryModal,
            },
            {
              icon: 'check',
              onPress: () => {
                selectedNovelIds.map(id => markAllChaptersRead(id));
                setSelectedNovelIds([]);
                refetchLibrary();
              },
            },
            {
              icon: 'check-outline',
              onPress: () => {
                selectedNovelIds.map(id => markAllChaptersUnread(id));
                setSelectedNovelIds([]);
                refetchLibrary();
              },
            },
            {
              icon: 'delete-outline',
              onPress: () => {
                selectedNovelIds.map(id => unfollowNovel(id));
                setSelectedNovelIds([]);
              },
            },
          ]}
        />
      </Portal>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  tabBar: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  globalSearchBtn: {
    margin: 16,
  },
  globalSearchBtnLabel: {
    fontWeight: 'bold',
  },
});
