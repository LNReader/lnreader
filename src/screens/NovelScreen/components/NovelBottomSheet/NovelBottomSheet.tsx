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
  useNovelReducer,
  useSavedNovelData,
  useTheme,
} from '../../../../redux/hooks';

import {ThemeType} from '../../../../theme/types';
import Checkbox, {
  CheckboxStatus,
  SortItem,
  SortItemStatus,
} from '../../../../components/Checkbox/Checkbox';
import {
  ChapterTitleDisplayModes,
  setNovelChapterFilter,
  setNovelChapterSortOrder,
  setNovelChapterTitleDisplayMode,
} from '../../../../redux/localStorage/localStorageSlice';
import {chapterFilters, chapterSortOrders} from '../../utils/constants';
import {RadioButton} from '../../../../components';

interface NovelBottomSheetProps {
  bottomSheetRef: any;
  theme: ThemeType;
}

const FilterTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {novel} = useNovelReducer();
  const {filters = []} = useSavedNovelData(novel ? novel.novelId : -1);

  return (
    <View>
      <FlatList
        data={chapterFilters}
        keyExtractor={item => item.filter}
        renderItem={({item}) => (
          <Checkbox
            label={item.label}
            status={
              filters.includes(item.filter)
                ? CheckboxStatus.Checked
                : CheckboxStatus.Unchecked
            }
            onPress={() =>
              dispatch(
                setNovelChapterFilter({
                  novelId: novel?.novelId,
                  filter: item.filter,
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

const SortTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {novel} = useNovelReducer();
  const {sort = chapterSortOrders[0].ASC} = useSavedNovelData(
    novel ? novel.novelId : -1,
  );

  return (
    <View>
      <FlatList
        data={chapterSortOrders}
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
                setNovelChapterSortOrder({
                  novelId: novel?.novelId,
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

  const {novel} = useNovelReducer();
  const {chapterTitleDisplayMode = ChapterTitleDisplayModes.SOURCE_TITLE} =
    useSavedNovelData(novel ? novel.novelId : -1);

  return (
    <View>
      <FlatList
        data={Object.values(ChapterTitleDisplayModes)}
        keyExtractor={item => item}
        renderItem={curentMode => (
          <RadioButton
            label={curentMode.item}
            status={
              curentMode.item === chapterTitleDisplayMode
                ? 'checked'
                : 'unchecked'
            }
            onPress={() =>
              dispatch(
                setNovelChapterTitleDisplayMode({
                  novelId: novel?.novelId,
                  chapterTitleDisplayMode: curentMode.item,
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

const NovelBottomSheet: React.FC<NovelBottomSheetProps> = ({
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
      draggableRange={{top: 220, bottom: 0}}
      snappingPoints={[0, 220]}
      showBackdrop={true}
      backdropOpacity={0}
      height={220}
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

export default NovelBottomSheet;

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
