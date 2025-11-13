import { LegendList, LegendListRenderItemProps } from '@legendapp/list';
import { ThemeColors } from '@theme/types';
import color from 'color';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NovelDrawerProps {
  theme: ThemeColors;
  pages: string[];
  pageIndex: number;
  openPage: (index: number) => void;
  closeDrawer: () => void;
}
export default function NovelDrawer({
  theme,
  pages,
  pageIndex,
  openPage,
  closeDrawer,
}: NovelDrawerProps) {
  const insets = useSafeAreaInsets();
  const renderItem = ({ item, index }: LegendListRenderItemProps<string>) => (
    <View
      style={[
        styles.drawerElementContainer,
        index === pageIndex && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        style={styles.pageCtn}
        onPress={() => {
          openPage(index);
          closeDrawer();
        }}
      >
        <View>
          <Text style={{ color: theme.onSurfaceVariant }}>{item}</Text>
        </View>
      </Pressable>
    </View>
  );
  return (
    <View
      style={[
        styles.drawer,
        { backgroundColor: theme.surface, paddingBottom: insets.bottom },
      ]}
    >
      <Text
        style={[
          styles.headerCtn,
          { color: theme.onSurface, borderBottomColor: theme.outline },
        ]}
      >
        Novel pages
      </Text>
      <LegendList
        data={pages}
        recycleItems
        extraData={pageIndex}
        renderItem={renderItem}
        estimatedItemSize={60}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    height: 100,
    paddingTop: 60,
  },
  drawerElementContainer: {
    borderRadius: 50,
    margin: 4,
    marginLeft: 16,
    marginRight: 16,
    minHeight: 48,
    overflow: 'hidden',
  },
  headerCtn: {
    borderBottomWidth: 1,
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 4,
    padding: 16,
  },
  pageCtn: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
