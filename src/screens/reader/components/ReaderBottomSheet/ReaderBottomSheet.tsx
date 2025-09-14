import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {
  RefObject,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from 'react';
import Color from 'color';

import { BottomSheetFlashList, BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useTheme } from '@hooks/persisted';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '@strings/translations';

import { overlay } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RenderSettings from '@screens/settings/dynamic/RenderSettings';
import ReaderSettings from '@screens/settings/settingsGroups/readerSettingsGroup';
import { useSettingsContext } from '@components/Context/SettingsContext';
import SETTINGS, {
  QuickSettingsItem,
  readerIds,
} from '@screens/settings/Settings';

type TabViewLabelProps = {
  route: {
    key: string;
    title: string;
  };
  labelText?: string;
  focused: boolean;
  color: string;
  allowFontScaling?: boolean;
  style?: StyleProp<TextStyle | null>;
};

const ReaderTab: React.FC = React.memo(() => {
  const settings = ReaderSettings.subGroup.filter(
    v => v.id === 'readerTheme',
  )[0].settings;
  return (
    <Suspense fallback={<></>}>
      <View style={styles.readerTab}>
        {settings.map((v, i) => (
          <RenderSettings key={i} setting={v} />
        ))}
      </View>
    </Suspense>
  );
});

const GeneralTab: React.FC = React.memo(() => {
  const settings = useSettingsContext();

  const quickSettings = useMemo(() => {
    const ids: readerIds[] = ['general', 'autoScroll', 'display'];
    const selectedSettings = SETTINGS.reader.subGroup
      .filter(sg => ids.includes(sg.id))
      .flatMap(sg => sg.settings);
    return (selectedSettings?.filter(s => s.quickSettings) ??
      []) as Array<QuickSettingsItem>;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: QuickSettingsItem }) => (
      <RenderSettings setting={item} quickSettings />
    ),
    [],
  );

  return (
    <BottomSheetFlashList
      data={quickSettings}
      extraData={[settings]}
      keyExtractor={(_: any, i: number) => `general${i}`}
      renderItem={renderItem}
      estimatedItemSize={60}
    />
  );
});

interface ReaderBottomSheetV2Props {
  bottomSheetRef: RefObject<BottomSheetModalMethods | null>;
}

const routes = [
  { key: 'readerTab', title: getString('readerSettings.title') },
  { key: 'generalTab', title: getString('generalSettings') },
];

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();
  const { bottom, left, right } = useSafeAreaInsets();
  const layout = useWindowDimensions();

  const tabHeaderColor = overlay(2, theme.surface);
  const backgroundColor = tabHeaderColor;

  const renderScene = useMemo(
    () => SceneMap({ readerTab: ReaderTab, generalTab: GeneralTab }),
    [],
  );

  const [index, setIndex] = useState(0);

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={[styles.tabBar, { backgroundColor: tabHeaderColor }]}
        inactiveColor={theme.onSurfaceVariant}
        activeColor={theme.primary}
        pressColor={Color(theme.primary).alpha(0.12).string()}
      />
    ),
    [theme, tabHeaderColor],
  );

  const renderLabel = useCallback(({ route, color }: TabViewLabelProps) => {
    return <Text style={{ color }}>{route.title}</Text>;
  }, []);

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      snapPoints={[360, 600]}
      backgroundStyle={{ backgroundColor }}
      bottomInset={bottom}
      containerStyle={[
        styles.container,
        { marginLeft: left, marginRight: right },
      ]}
    >
      <BottomSheetView style={styles.flex}>
        <GestureHandlerRootView style={styles.flex}>
          <TabView
            commonOptions={{
              label: renderLabel,
            }}
            navigationState={{ index, routes }}
            renderTabBar={renderTabBar}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width, height: 400 }}
            style={styles.tabView}
          />
        </GestureHandlerRootView>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default React.memo(ReaderBottomSheetV2);

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
  readerTab: {
    paddingVertical: 8,
    flex: 1,
  },
  tabBar: {
    borderBottomWidth: 0.5,
    elevation: 0,
  },
  tabView: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 800,
  },
  flex: { flex: 1 },
});
