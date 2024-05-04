import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  Pressable,
  Image,
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useBrowseSettings, usePlugins } from '@hooks/persisted';
import { PluginItem } from '@plugins/types';
import {
  FlashList,
  ListRenderItem as FlashListRenderItem,
  ListRenderItemInfo,
} from '@shopify/flash-list';
import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';
import { Swipeable } from 'react-native-gesture-handler';
import { getString } from '@strings/translations';
import { BrowseScreenProps } from '@navigators/types';
import { Button, IconButtonV2 } from '@components';
import TrackerCard from '../discover/TrackerCard';
import { showToast } from '@utils/showToast';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { groupBy } from 'lodash-es';

interface AvailableTabProps {
  searchText: string;
  theme: ThemeColors;
}

interface InstalledTabProps {
  navigation: BrowseScreenProps['navigation'];
  theme: ThemeColors;
  searchText: string;
}

export const InstalledTab = memo(
  ({ navigation, theme, searchText }: InstalledTabProps) => {
    const {
      filteredInstalledPlugins,
      lastUsedPlugin,
      setLastUsedPlugin,
      uninstallPlugin,
      updatePlugin,
    } = usePlugins();
    const { showMyAnimeList, showAniList } = useBrowseSettings();
    const navigateToSource = useCallback(
      (plugin: PluginItem, showLatestNovels?: boolean) => {
        navigation.navigate('SourceScreen', {
          pluginId: plugin.id,
          pluginName: plugin.name,
          site: plugin.site,
          showLatestNovels,
        });
        setLastUsedPlugin(plugin);
      },
      [],
    );

    const searchedPlugins = useMemo(() => {
      if (searchText) {
        return filteredInstalledPlugins.filter(plg =>
          plg.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
        );
      } else {
        return filteredInstalledPlugins;
      }
    }, [searchText, filteredInstalledPlugins]);

    const renderItem: FlashListRenderItem<PluginItem> = useCallback(
      ({ item }) => {
        return (
          <Swipeable
            renderLeftActions={(progress, dragX, ref) => {
              return (
                <View
                  style={[
                    styles.buttonGroup,
                    { backgroundColor: theme.inverseSurface },
                  ]}
                >
                  <IconButtonV2
                    name="earth"
                    size={22}
                    color={theme.inverseOnSurface}
                    onPress={() => {
                      ref.close();
                      navigation.navigate('WebviewScreen', {
                        name: item.name,
                        url: item.site,
                        pluginId: item.id,
                      });
                    }}
                    theme={theme}
                  />
                </View>
              );
            }}
            renderRightActions={(progress, dragX, ref) => (
              <View
                style={[styles.buttonGroup, { backgroundColor: theme.error }]}
              >
                <IconButtonV2
                  name="delete"
                  size={22}
                  color={theme.onError}
                  onPress={() => {
                    ref.close();
                    uninstallPlugin(item).then(() =>
                      showToast(
                        getString('browseScreen.uninstalledPlugin', {
                          name: item.name,
                        }),
                      ),
                    );
                  }}
                  theme={theme}
                />
              </View>
            )}
          >
            <Pressable
              style={[styles.container, { backgroundColor: theme.surface }]}
              android_ripple={{ color: theme.rippleColor }}
              onPress={() => navigateToSource(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: item.iconUrl }} style={styles.icon} />
                <View style={styles.details}>
                  <Text
                    numberOfLines={1}
                    style={[{ color: theme.onSurface }, styles.name]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[{ color: theme.onSurfaceVariant }, styles.addition]}
                  >
                    {`${item.lang} - ${item.version}`}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }} />
              {item.hasUpdate ? (
                <IconButtonV2
                  name="download-outline"
                  size={22}
                  color={theme.primary}
                  onPress={() => {
                    updatePlugin(item)
                      .then(version =>
                        showToast(
                          getString('browseScreen.updatedTo', { version }),
                        ),
                      )
                      .catch((error: Error) => showToast(error.message));
                  }}
                  theme={theme}
                />
              ) : null}
              <Button
                title={getString('browseScreen.latest')}
                textColor={theme.primary}
                onPress={() => navigateToSource(item, true)}
              />
            </Pressable>
          </Swipeable>
        );
      },
      [theme, searchedPlugins],
    );

    return (
      <FlashList
        estimatedItemSize={64}
        data={searchedPlugins}
        extraData={theme}
        renderItem={renderItem}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id + '_installed'}
        ListHeaderComponent={
          <>
            {showMyAnimeList || showAniList ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.discover')}
                </Text>
                {showAniList ? (
                  <TrackerCard
                    theme={theme}
                    icon={require('../../../../assets/anilist.png')}
                    trackerName="Anilist"
                    onPress={() => navigation.navigate('BrowseAL')}
                  />
                ) : null}
                {showMyAnimeList ? (
                  <TrackerCard
                    theme={theme}
                    icon={require('../../../../assets/mal.png')}
                    trackerName="MyAnimeList"
                    onPress={() => navigation.navigate('BrowseMal')}
                  />
                ) : null}
              </>
            ) : null}
            {lastUsedPlugin ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.lastUsed')}
                </Text>
                {renderItem({
                  item: lastUsedPlugin,
                  index: 0,
                } as ListRenderItemInfo<PluginItem>)}
              </>
            ) : null}
            <Text
              style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
            >
              {getString('browseScreen.installedPlugins')}
            </Text>
          </>
        }
      />
    );
  },
);

interface AvailablePluginCardProps {
  plugin: PluginItem;
  theme: ThemeColors;
  installPlugin: (plugin: PluginItem) => Promise<void>;
}

const AvailablePluginCard = ({
  plugin,
  theme,
  installPlugin,
}: AvailablePluginCardProps) => {
  const ratio = useSharedValue(1);
  const imageStyles = useAnimatedStyle(() => ({
    height: ratio.value * 40,
  }));
  const viewStyles = useAnimatedStyle(() => ({
    height: ratio.value * 64,
    paddingVertical: ratio.value * 12,
  }));
  const textStyles = useAnimatedStyle(() => ({
    lineHeight: ratio.value * 20,
  }));
  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.surface }, viewStyles]}
    >
      <Animated.View style={{ flexDirection: 'row' }}>
        <Animated.Image
          source={{ uri: plugin.iconUrl }}
          style={[styles.icon, imageStyles]}
        />
        <Animated.View style={styles.details}>
          <Animated.Text
            numberOfLines={1}
            style={[
              {
                color: theme.onSurface,
              },
              styles.name,
              textStyles,
            ]}
          >
            {plugin.name}
          </Animated.Text>
          <Animated.Text
            numberOfLines={1}
            style={[
              { color: theme.onSurfaceVariant },
              styles.addition,
              textStyles,
            ]}
          >
            {`${plugin.lang} - ${plugin.version}`}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <IconButtonV2
        name="download-outline"
        color={theme.primary}
        onPress={() => {
          ratio.value = withTiming(0, { duration: 500 });
          installPlugin(plugin)
            .then(() => {
              showToast(
                getString('browseScreen.installedPlugin', {
                  name: plugin.name,
                }),
              );
            })
            .catch((error: Error) => {
              showToast(error.message);
              ratio.value = 1;
            });
        }}
        size={22}
        theme={theme}
      />
    </Animated.View>
  );
};

export const AvailableTab = memo(({ searchText, theme }: AvailableTabProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    filteredAvailablePlugins,
    languagesFilter,
    refreshPlugins,
    installPlugin,
  } = usePlugins();

  const sections = useMemo(() => {
    const list = [];
    const group = groupBy(
      searchText
        ? filteredAvailablePlugins.filter(plg =>
            plg.name.toLocaleLowerCase().includes(searchText.toLowerCase()),
          )
        : filteredAvailablePlugins,
      'lang',
    );
    for (const language of languagesFilter) {
      if (group[language]?.length) {
        list.push({
          header: language,
          data: group[language],
        });
      }
    }
    return list;
  }, [searchText, filteredAvailablePlugins]);

  const renderItem: ListRenderItem<PluginItem> = useCallback(
    ({ item }) => {
      return (
        <AvailablePluginCard
          plugin={item}
          theme={theme}
          installPlugin={installPlugin}
        />
      );
    },
    [theme, sections],
  );

  return (
    <SectionList
      sections={sections}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      keyExtractor={item => item.id + '_available'}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            refreshPlugins()
              .finally(() => setRefreshing(false))
              .catch(e => {
                showToast(e);
              });
          }}
          colors={[theme.onPrimary]}
          progressBackgroundColor={theme.primary}
        />
      }
      renderItem={renderItem}
      renderSectionHeader={({ section: { header, data } }) =>
        data.length ? (
          <Text style={[styles.listHeader, { color: theme.onSurfaceVariant }]}>
            {header}
          </Text>
        ) : null
      }
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  listHeader: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontWeight: '600',
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  details: {
    marginLeft: 16,
  },
  addition: {
    fontSize: 12,
    lineHeight: 20,
  },
  name: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  spinner: {
    marginRight: 12,
    marginLeft: -1,
  },
});
