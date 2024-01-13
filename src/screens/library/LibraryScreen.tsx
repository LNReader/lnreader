import React, { useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from 'react-native-tab-view';
import color from 'color';

import { SearchbarV2, Button } from '@components/index';
import { LibraryView } from './components/LibraryListView';
import LibraryBottomSheet from './components/LibraryBottomSheet/LibraryBottomSheet';
import { Banner } from './components/Banner';
import { Actionbar } from '@components/Actionbar/Actionbar';

import { useLibrary } from './hooks/useLibrary';
import {
  useAppSettings,
  useHistory,
  useLibrarySettings,
  useTheme,
} from '@hooks/persisted';
import { useSearch, useBackHandler, useBoolean } from '@hooks';
import { getString } from '@strings/translations';
import { FAB, Portal } from 'react-native-paper';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '@database/queries/ChapterQueries';
import { removeNovelsFromLibrary } from '@database/queries/NovelQueries';
import SetCategoryModal from '@screens/novel/components/SetCategoriesModal';
import { debounce } from 'lodash-es';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { Row } from '@components/Common';
import { LibraryScreenProps } from '@navigators/types';
import { ChapterInfo, NovelInfo } from '@database/types';

type State = NavigationState<{
  key: string;
  title: string;
}>;

const LibraryScreen = ({ navigation }: LibraryScreenProps) => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const {
    showNumberOfNovels = false,
    downloadedOnlyMode = false,
    incognitoMode = false,
  } = useLibrarySettings();

  const { useLibraryFAB = false } = useAppSettings();

  const { isLoading: isHistoryLoading, history, error } = useHistory();

  const { right: rightInset } = useSafeAreaInsets();

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

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);

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
        <Row>
          <Text style={{ color }}>{route.title}</Text>
          <View
            style={[styles.badgeCtn, { backgroundColor: theme.surfaceVariant }]}
          >
            {showNumberOfNovels && (
              <Text
                style={[styles.badgetText, { color: theme.onSurfaceVariant }]}
              >
                {(route as any)?.novels.length}
              </Text>
            )}
          </View>
        </Row>
      )}
      inactiveColor={theme.secondary}
      activeColor={theme.primary}
      pressColor={theme.rippleColor}
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
                    library[index].novels.map(novel => novel.id),
                  ),
              }
            : {
                iconName: 'filter-variant',
                onPress: () => bottomSheetRef.current?.present(),
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
            <SourceScreenSkeletonLoading theme={theme} />
          ) : (
            <>
              {searchText ? (
                <Button
                  title={`${getString(
                    'common.searchFor',
                  )} "${searchText}" ${getString('common.globally')}`}
                  style={styles.globalSearchBtn}
                  onPress={() =>
                    navigation.navigate('GlobalSearchScreen', {
                      searchText,
                    })
                  }
                />
              ) : null}
              <LibraryView
                categoryId={route.id}
                novels={route.novels}
                selectedNovelIds={selectedNovelIds}
                setSelectedNovelIds={setSelectedNovelIds}
                navigation={navigation}
              />
            </>
          )
        }
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      {useLibraryFAB &&
        !isHistoryLoading &&
        history &&
        history.length !== 0 &&
        !error && (
          <FAB
            style={[
              styles.fab,
              { backgroundColor: theme.primary, marginRight: rightInset + 16 },
            ]}
            color={theme.onPrimary}
            uppercase={false}
            label={'Resume'}
            icon="play"
            onPress={() => {
              navigation.navigate('Chapter', {
                novel: {
                  id: history[0].novelId,
                  url: history[0].novelUrl,
                  pluginId: history[0].pluginId,
                  name: history[0].novelName,
                } as NovelInfo,
                chapter: {
                  id: history[0].id,
                  url: history[0].chapterUrl,
                  name: history[0].chapterName,
                  novelId: history[0].novelId,
                } as ChapterInfo,
              });
            }}
          />
        )}
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
      <LibraryBottomSheet bottomSheetRef={bottomSheetRef} />
      <Portal>
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
                removeNovelsFromLibrary(selectedNovelIds);
                setSelectedNovelIds([]);
                refetchLibrary();
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

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  badgeCtn: {
    borderRadius: 50,
    marginHorizontal: 6,
    paddingHorizontal: 6,
  },
  badgetText: {
    fontSize: 12,
  },
});
