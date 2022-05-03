import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as WebBrowser from 'expo-web-browser';

import { NovelInfo } from '../../../../database/types';
import { useNavigation } from '@react-navigation/native';
import { useNovelTrackerInfo } from '../../../../hooks';
import { ThemeTypeV1 } from '../../../../theme/v1/theme/types';
import { getString } from '../../../../../strings/translations';

interface NovelScreenButtonGroupProps {
  novel: NovelInfo;
  theme: ThemeTypeV1;
  handleTrackerSheet: () => void;
  handleFollowNovel: () => void;
}

const NovelScreenButtonGroup: React.FC<NovelScreenButtonGroupProps> = ({
  novel,
  handleTrackerSheet,
  handleFollowNovel,
  theme,
}) => {
  const { followed, sourceUrl } = novel;
  const { navigate } = useNavigation();
  const followButtonColor = followed ? theme.colorAccent : theme.textColorHint;

  const { isTracked, isTrackerAvailable } = useNovelTrackerInfo(novel.novelId);

  const trackerButtonColor = isTracked
    ? theme.colorAccent
    : theme.textColorHint;

  const handleOpenWebView = async () => {
    WebBrowser.openBrowserAsync(sourceUrl);
  };

  const handleMigrateNovel = () =>
    navigate(
      'MigrateNovel' as never,
      {
        sourceId: novel.sourceId,
        novelName: novel.novelName,
      } as never,
    );

  return (
    <View style={styles.buttonGroupContainer}>
      <View style={styles.buttonContainer}>
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          onPress={handleFollowNovel}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name={followed ? 'heart' : 'heart-outline'}
            color={followButtonColor}
            size={24}
          />
          <Text style={[styles.buttonLabel, { color: followButtonColor }]}>
            {getString(
              followed ? 'novelScreen.inLibaray' : 'novelScreen.addToLibaray',
            )}
          </Text>
        </Pressable>
      </View>
      {isTrackerAvailable ? (
        <View style={styles.buttonContainer}>
          <Pressable
            android_ripple={{ color: theme.rippleColor }}
            onPress={handleTrackerSheet}
            style={styles.button}
          >
            <MaterialCommunityIcons
              name={isTracked ? 'check' : 'sync'}
              color={trackerButtonColor}
              size={24}
            />
            <Text style={[styles.buttonLabel, { color: trackerButtonColor }]}>
              {isTracked ? 'Tracked' : 'Tracking'}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.buttonContainer}>
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          onPress={handleMigrateNovel}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="swap-vertical-variant"
            color={theme.textColorHint}
            size={24}
          />
          <Text style={[styles.buttonLabel, { color: theme.textColorHint }]}>
            {getString('novelScreen.migrate')}
          </Text>
        </Pressable>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          onPress={handleOpenWebView}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="earth"
            color={theme.textColorHint}
            size={24}
          />
          <Text style={[styles.buttonLabel, { color: theme.textColorHint }]}>
            WebView
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default NovelScreenButtonGroup;

const styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    marginTop: 4,
    fontSize: 12,
  },
});
