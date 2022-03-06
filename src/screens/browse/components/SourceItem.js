import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

import { Button, IconButton } from 'react-native-paper';

import { pinSourceAction } from '../../../redux/source/source.actions';

const SourceItem = ({ item, theme, isPinned, dispatch, navigation }) => {
  const { sourceId, sourceName, icon, lang } = item;

  const navigateToSource = useCallback(
    () =>
      navigation.navigate('Extension', {
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        url: item.url,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Pressable
      style={styles.container}
      onPress={navigateToSource}
      android_ripple={{ color: theme.rippleColor }}
    >
      <Image source={{ uri: icon }} style={styles.icon} />
      <View style={styles.extensionDetails}>
        <View>
          <Text
            style={{
              color: theme.textColorPrimary,
              fontSize: 14,
            }}
          >
            {sourceName}
          </Text>
          <Text
            style={{
              color: theme.textColorSecondary,
              fontSize: 12,
            }}
          >
            {lang}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button
            labelStyle={{ letterSpacing: 0 }}
            uppercase={false}
            color={theme.colorAccent}
            onPress={navigateToSource}
          >
            Browse
          </Button>
          <IconButton
            icon={isPinned ? 'pin' : 'pin-outline'}
            animated
            size={21}
            onPress={() => dispatch(pinSourceAction(sourceId))}
            color={isPinned ? theme.colorAccent : theme.textColorSecondary}
            style={{ margin: 2 }}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default SourceItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  extensionDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  sourceStatus: {
    color: '#C14033',
    fontSize: 12,
    marginLeft: 5,
  },
});
