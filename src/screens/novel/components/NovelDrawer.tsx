import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ThemeColors } from '@theme/types';
import color from 'color';
import { RefObject } from 'react';
import { DrawerLayoutAndroid, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NovelDrawerProps {
  theme: ThemeColors;
  pages: string[];
  pageIndex: number;
  openPage: (index: number) => void;
  drawerRef: RefObject<DrawerLayoutAndroid>;
}
export default function NovelDrawer({
  theme,
  pages,
  pageIndex,
  openPage,
  drawerRef,
}: NovelDrawerProps) {
  const insets = useSafeAreaInsets();
  const renderItem: ListRenderItem<string> = ({ item, index }) => (
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
          drawerRef.current?.closeDrawer();
        }}
      >
        <View>
          <Text style={[{ color: theme.onSurfaceVariant }]}>{item}</Text>
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
      <FlashList
        data={pages}
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
    paddingTop: 60,
    height: 100,
  },
  headerCtn: {
    fontSize: 16,
    padding: 16,
    marginBottom: 4,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  drawerElementContainer: {
    margin: 4,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 50,
    overflow: 'hidden',
    minHeight: 48,
  },
  pageCtn: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
});
