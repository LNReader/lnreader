import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { NovelInfo } from '../../../../database/types';
import { useNavigation } from '@react-navigation/native';
import { useBoolean, useNovelTrackerInfo } from '../../../../hooks';
import { ThemeColors } from '../../../../theme/types';
import { getString } from '../../../../../strings/translations';
import { Portal } from 'react-native-paper';
import SetCategoryModal from '../SetCategoriesModal';

interface NovelScreenButtonGroupProps {
  novel: NovelInfo;
  theme: ThemeColors;
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
  const followButtonColor = followed ? theme.primary : theme.outline;

  const { isTracked, isTrackerAvailable } = useNovelTrackerInfo(novel.novelId);

  const trackerButtonColor = isTracked ? theme.primary : theme.outline;

  const handleOpenWebView = async () => {
    navigate('WebviewScreen', {
      sourceId: novel.sourceId,
      name: novel.source,
      url: sourceUrl,
    });
  };

  const handleMigrateNovel = () =>
    navigate(
      'MigrateNovel' as never,
      {
        sourceId: novel.sourceId,
        novelName: novel.novelName,
      } as never,
    );

  const {
    value: setCategoryModalVisible,
    setTrue: showSetCategoryModal,
    setFalse: closeSetCategoryModal,
  } = useBoolean();

  return (
    <>
      <View style={styles.buttonGroupContainer}>
        <View style={styles.buttonContainer}>
          <Pressable
            android_ripple={{ color: theme.rippleColor }}
            onPress={handleFollowNovel}
            onLongPress={showSetCategoryModal}
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
              color={theme.outline}
              size={24}
            />
            <Text style={[styles.buttonLabel, { color: theme.outline }]}>
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
              color={theme.outline}
              size={24}
            />
            <Text style={[styles.buttonLabel, { color: theme.outline }]}>
              WebView
            </Text>
          </Pressable>
        </View>
      </View>
      <Portal>
        <SetCategoryModal
          novelId={novel.novelId}
          currentCategoryIds={JSON.parse(novel.categoryIds) as number[]}
          closeModal={closeSetCategoryModal}
          visible={setCategoryModalVisible}
        />
      </Portal>
    </>
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
