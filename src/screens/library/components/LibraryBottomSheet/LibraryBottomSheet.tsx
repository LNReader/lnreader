import React, { LegacyRef, useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Bottomsheet from 'rn-sliding-up-panel';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import color from 'color';

import { useLibrarySettings } from '@hooks/useSettings';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { Checkbox, SortItem } from '@components/Checkbox/Checkbox';
import {
  DisplayModes,
  displayModesList,
  LibraryFilter,
  libraryFilterList,
  LibrarySortOrder,
  librarySortOrderList,
} from '@screens/library/constants/constants';
import { FlashList } from '@shopify/flash-list';
import { RadioButton } from '@components/RadioButton/RadioButton';
import { overlay } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LibraryBottomSheetProps {
  bottomSheetRef: LegacyRef<Bottomsheet> | null;
}

const FirstRoute = () => {
  const theme = useTheme();
  const {
    filter,
    setLibrarySettings,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        estimatedItemSize={4}
        extraData={[filter]}
        data={libraryFilterList}
        renderItem={({ item }) => (
          <Checkbox
            label={item.label}
            theme={theme}
            status={filter === item.filter}
            onPress={() =>
              setLibrarySettings({
                filter: filter === item.filter ? undefined : item.filter,
              })
            }
            disabled={
              item.filter === LibraryFilter.Downloaded && downloadedOnlyMode
            }
          />
        )}
      />
    </View>
  );
};

const SecondRoute = () => {
  const theme = useTheme();
  const { sortOrder = LibrarySortOrder.DateAdded_DESC, setLibrarySettings } =
    useLibrarySettings();

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={librarySortOrderList}
        extraData={[sortOrder]}
        estimatedItemSize={5}
        renderItem={({ item }) => (
          <SortItem
            label={item.label}
            theme={theme}
            status={
              sortOrder === item.ASC
                ? 'asc'
                : sortOrder === item.DESC
                ? 'desc'
                : undefined
            }
            onPress={() =>
              setLibrarySettings({
                sortOrder: sortOrder === item.ASC ? item.DESC : item.ASC,
              })
            }
          />
        )}
      />
    </View>
  );
};

const ThirdRoute = () => {
  const theme = useTheme();
  const {
    showDownloadBadges = true,
    showNumberOfNovels = false,
    showUnreadBadges = true,
    displayMode = DisplayModes.Comfortable,
    setLibrarySettings,
  } = useLibrarySettings();

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.sectionHeader, { color: theme.textColorSecondary }]}>
        {getString('libraryScreen.bottomSheet.display.badges')}
      </Text>
      <Checkbox
        label={getString('libraryScreen.bottomSheet.display.downloadBadges')}
        status={showDownloadBadges}
        onPress={() =>
          setLibrarySettings({
            showDownloadBadges: !showDownloadBadges,
          })
        }
        theme={theme}
      />
      <Checkbox
        label={getString('libraryScreen.bottomSheet.display.unreadBadges')}
        status={showUnreadBadges}
        onPress={() =>
          setLibrarySettings({
            showUnreadBadges: !showUnreadBadges,
          })
        }
        theme={theme}
      />
      <Checkbox
        label={getString('libraryScreen.bottomSheet.display.showNoOfItems')}
        status={showNumberOfNovels}
        onPress={() =>
          setLibrarySettings({
            showNumberOfNovels: !showNumberOfNovels,
          })
        }
        theme={theme}
      />
      <Text style={[styles.sectionHeader, { color: theme.textColorSecondary }]}>
        {getString('libraryScreen.bottomSheet.display.displayMode')}
      </Text>
      <FlashList
        estimatedItemSize={4}
        data={displayModesList}
        extraData={[displayMode]}
        renderItem={({ item }) => (
          <RadioButton
            label={item.label}
            status={displayMode === item.value}
            onPress={() => setLibrarySettings({ displayMode: item.value })}
            theme={theme}
          />
        )}
      />
    </View>
  );
};

const LibraryBottomSheet: React.FC<LibraryBottomSheetProps> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();
  const [animatedValue] = useState(new Animated.Value(0));

  const layout = useWindowDimensions();

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primary }}
      style={[
        {
          backgroundColor: overlay(2, theme.surface),
          borderBottomColor: color(theme.isDark ? '#FFFFFF' : '#000000')
            .alpha(0.12)
            .string(),
        },
        styles.tabBar,
      ]}
      renderLabel={({ route, color }) => (
        <Text style={{ color }}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.primary}
      pressColor={color(theme.primary).alpha(0.12).string()}
    />
  );

  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      { key: 'first', title: getString('novelScreen.bottomSheet.filter') },
      { key: 'second', title: getString('novelScreen.bottomSheet.sort') },
      { key: 'third', title: getString('novelScreen.bottomSheet.display') },
    ],
    [],
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const { bottom } = useSafeAreaInsets();

  const bottomSheetHeight = 480 + bottom;

  return (
    <Bottomsheet
      animatedValue={animatedValue}
      ref={bottomSheetRef}
      draggableRange={{ top: bottomSheetHeight, bottom: 0 }}
      snappingPoints={[0, bottomSheetHeight]}
      showBackdrop={true}
      backdropOpacity={0.3}
      height={bottomSheetHeight}
    >
      <View
        style={[
          styles.bottomSheetCtn,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <TabView
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={styles.tabView}
        />
      </View>
    </Bottomsheet>
  );
};

export default LibraryBottomSheet;

const styles = StyleSheet.create({
  bottomSheetCtn: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  tabBar: {
    borderBottomWidth: 1,
    elevation: 0,
  },
});
