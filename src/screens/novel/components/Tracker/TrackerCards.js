import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { TouchableRipple, IconButton } from 'react-native-paper';
import color from 'color';
import { getScoreFormatting } from './AniList';

export const AddTrackingCard = ({ theme, setTrackSearchDialog, icon }) => (
  <View style={styles.addCardContainer}>
    <Image source={icon} style={styles.trackerIcon} />
    <View style={styles.addCardPressableContainer}>
      <Pressable
        style={styles.rippleContainer}
        android_ripple={{
          color: color(theme.primary).alpha(0.12).string(),
          borderless: true,
        }}
        onPress={setTrackSearchDialog}
      >
        <Text style={[{ color: theme.primary }, styles.addTrackingText]}>
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
    <View style={[{ backgroundColor: theme.surface }, styles.cardContainer]}>
      <View
        style={[
          styles.titleContainer,
          { borderBottomColor: 'rgba(0, 0, 0, 0.12)' },
        ]}
      >
        <Image source={icon} style={styles.trackerIcon} />
        <View style={styles.listItemContainer}>
          <Text style={[{ color: theme.onSurfaceVariant }, styles.listItem]}>
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
      <View style={styles.trackedItemRow}>
        <TouchableRipple
          style={[
            { borderRightColor: 'rgba(0, 0, 0, 0.12)' },
            styles.listItemLeft,
          ]}
          borderless
          onPress={handSetTrackStatusDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[{ color: theme.onSurfaceVariant }, styles.listItem]}>
            {getStatus(trackItem.status)}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={styles.flex1}
          borderless
          onPress={handleSetTrackChaptersDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[{ color: theme.onSurfaceVariant }, styles.listItem]}>
            {`${trackItem.progress}/${
              trackItem.totalChapters ? trackItem.totalChapters : '-'
            }`}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={[
            { borderLeftColor: 'rgba(0, 0, 0, 0.12)' },
            styles.listItemRight,
          ]}
          borderless
          onPress={handleSetTrackScoreDialog}
          rippleColor={color(theme.primary).alpha(0.12).string()}
        >
          <Text style={[{ color: theme.onSurfaceVariant }, styles.listItem]}>
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
  addCardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 16,
  },
  addCardPressableContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  addTrackingText: {
    textAlignVertical: 'center',
  },
  cardContainer: {
    borderRadius: 8,
    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.1)',
    margin: 8,
  },
  trackedItemRow: {
    height: 50,
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  listItem: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  listItemContainer: {
    borderTopRightRadius: 4,
    flex: 1,
    flexDirection: 'row',
  },
  listItemLeft: {
    borderBottomLeftRadius: 4,
    borderRightWidth: 1,
    flex: 1,
  },
  listItemRight: {
    borderBottomRightRadius: 4,
    borderLeftWidth: 1,
    flex: 1,
  },
  rippleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  titleContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  trackerIcon: {
    borderRadius: 8,
    height: 50,
    width: 50,
  },
});
