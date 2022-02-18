import React, {useState} from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import Bottomsheet from 'rn-sliding-up-panel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  useAppDispatch,
  useAppearanceSettings,
  useLibrarySettings,
  useTheme,
} from '../../../../redux/hooks';

import {ThemeType} from '../../../../theme/types';

import {libraryFilters, librarySortOrders} from '../../utils/constants';

import Checkbox, {
  CheckboxStatus,
  SortItem,
  SortItemStatus,
} from '../../../../components/Checkbox/Checkbox';

import {
  DisplayModes,
  setDisplayMode,
  setLibraryFilter,
  setLibrarySortOrder,
  toggleShowDownloadsBadge,
  toggleShowUnreadBadge,
} from '../../../../redux/settings/settingsSlice';

import {RadioButton} from '../../../../components';

interface LibraryBottomSheetProps {
  bottomSheetRef: any;
  theme: ThemeType;
}

const FilterTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {filters} = useLibrarySettings();

  return (
    <View>
      <FlatList
        data={libraryFilters}
        keyExtractor={item => item.filter}
        renderItem={({item}) => (
          <Checkbox
            label={item.label}
            status={
              filters.includes(item.filter)
                ? CheckboxStatus.Checked
                : CheckboxStatus.Unchecked
            }
            onPress={() => dispatch(setLibraryFilter({filter: item.filter}))}
            theme={theme}
          />
        )}
      />
    </View>
  );
};

const SortTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {sort} = useLibrarySettings();

  return (
    <View>
      <FlatList
        data={librarySortOrders}
        keyExtractor={item => item.label}
        renderItem={({item}) => (
          <SortItem
            label={item.label}
            status={
              sort === item.ASC
                ? SortItemStatus.ASC
                : sort === item.DESC
                ? SortItemStatus.DESC
                : null
            }
            onPress={() =>
              dispatch(
                setLibrarySortOrder({
                  sort: sort === item.ASC ? item.DESC : item.ASC,
                }),
              )
            }
            theme={theme}
          />
        )}
      />
    </View>
  );
};

const DisplayTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {displayMode} = useAppearanceSettings();
  const {showUnreadBadge, showDownloadsBadge} = useLibrarySettings();

  return (
    <View>
      <Text style={[styles.header, {color: theme.primary}]}>Display modes</Text>
      <RadioButton
        label="Compact"
        status={displayMode === DisplayModes.Compact ? 'checked' : 'unchecked'}
        onPress={() => dispatch(setDisplayMode(DisplayModes.Compact))}
        theme={theme}
      />
      <RadioButton
        label="Comfortable"
        status={
          displayMode === DisplayModes.Comfortable ? 'checked' : 'unchecked'
        }
        onPress={() => dispatch(setDisplayMode(DisplayModes.Comfortable))}
        theme={theme}
      />
      <RadioButton
        label="No title"
        status={displayMode === DisplayModes.NoTitle ? 'checked' : 'unchecked'}
        onPress={() => dispatch(setDisplayMode(DisplayModes.NoTitle))}
        theme={theme}
      />
      <RadioButton
        label="List"
        status={displayMode === DisplayModes.List ? 'checked' : 'unchecked'}
        onPress={() => dispatch(setDisplayMode(DisplayModes.List))}
        theme={theme}
      />
      <Text style={[styles.header, {color: theme.primary}]}>Badges</Text>
      <RadioButton
        label="Downloaded chapters"
        status={showDownloadsBadge ? 'checked' : 'unchecked'}
        onPress={() => dispatch(toggleShowDownloadsBadge())}
        theme={theme}
      />
      <RadioButton
        label="Unread chapters"
        status={showUnreadBadge ? 'checked' : 'unchecked'}
        onPress={() => dispatch(toggleShowUnreadBadge())}
        theme={theme}
      />
    </View>
  );
};

const LibraryBottomSheet: React.FC<LibraryBottomSheetProps> = ({
  bottomSheetRef,
  theme,
}) => {
  const {bottom} = useSafeAreaInsets();

  const [animatedValue] = useState(new Animated.Value(0));

  const renderScene = SceneMap({
    first: FilterTab,
    second: SortTab,
    third: DisplayTab,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Filter'},
    {key: 'second', title: 'Sort'},
    {key: 'third', title: 'Display'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.primary}}
      style={[
        styles.tabBarStyle,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.divider,
        },
      ]}
      renderLabel={({route, color}) => (
        <Text style={{color}}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.primary}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <Bottomsheet
      ref={bottomSheetRef}
      animatedValue={animatedValue}
      draggableRange={{top: 460, bottom: 0}}
      snappingPoints={[0, 460]}
      showBackdrop={true}
      backdropOpacity={0}
      height={460}
    >
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.surface,
            paddingBottom: bottom,
          },
        ]}
      >
        <TabView
          navigationState={{index, routes}}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          style={styles.tabView}
        />
      </View>
    </Bottomsheet>
  );
};

export default LibraryBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    zIndex: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tabBarStyle: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  header: {
    padding: 16,
  },
});
