import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { TouchableRipple, IconButton } from 'react-native-paper';
import { getScoreFormatting } from './AniList';

import color from 'color';

export const AddTrackingCard = ({ theme, setTrackSearchDialog, icon }) => (
  <View style={styles.addCardContainer}>
    <Image source={icon} style={styles.trackerIcon} />

    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden',
        marginHorizontal: 16,
      }}
    >
      <Pressable
        style={styles.rippleContainer}
        android_ripple={{
          color: color(theme.primary).alpha(0.12).string(),
          borderless: true,
        }}
        onPress={setTrackSearchDialog}
      >
        <Text
          style={{
            textAlignVertical: 'center',
            color: theme.primary,
          }}
        >
          Add Tracking
        </Text>
      </Pressable>
    </View>
  </View>
);

export const TrackedItemCard = ({
  tracker,
  untrackNovel,
  trackItem,
  handSetTrackStatusDialog,
  handleSetTrackChaptersDialog,
  handleSetTrackScoreDialog,
  getStatus,
  theme,
  icon,
}) => {
  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.surface }]}>
      <View
        style={[styles.titleContainer, { borderBottomColor: theme.outline }]}
      >
        <Image source={icon} style={styles.trackerIcon} />
        <View style={styles.listItemContainer}>
          <Text style={[styles.listItem, { color: theme.onSurfaceVariant }]}>
            {trackItem.title}
          </Text>
          <IconButton
            icon="close"
            color={theme.onSurfaceVariant}
            size={21}
            onPress={untrackNovel}
          />
        </View>
      </View>
      <View style={{ height: 50, flexDirection: 'row' }}>
        <TouchableRipple
          style={[styles.listItemLeft, { borderRightColor: theme.outline }]}
          borderless
          onPress={handSetTrackStatusDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[styles.listItem, { color: theme.onSurfaceVariant }]}>
            {getStatus(trackItem.status)}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={{ flex: 1 }}
          borderless
          onPress={handleSetTrackChaptersDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[styles.listItem, { color: theme.onSurfaceVariant }]}>
            {`${trackItem.progress}/${
              trackItem.totalChapters ? trackItem.totalChapters : '-'
            }`}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={[styles.listItemRight, { borderLeftColor: theme.outline }]}
          borderless
          onPress={handleSetTrackScoreDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[styles.listItem, { color: theme.onSurfaceVariant }]}>
            {tracker.name === 'AniList'
              ? getScoreFormatting(tracker.auth.meta.scoreFormat, true).label(
                  trackItem.score,
                )
              : trackItem.score === 0
              ? '-'
              : trackItem.score}
          </Text>
        </TouchableRipple>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  trackerIcon: {
    height: 50,
    width: 50,
    borderRadius: 8,
  },
  rippleContainer: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  cardContainer: {
    margin: 8,
    elevation: 2,
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    padding: 4,
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    borderTopRightRadius: 4,
  },
  listItem: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  listItemLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: 4,
  },
  listItemRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomRightRadius: 4,
  },
});
