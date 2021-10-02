import React from 'react';
import {StyleSheet, View, Text, Image, Pressable} from 'react-native';
import {TouchableRipple, IconButton} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {untrackNovel} from '../../../../redux/tracker/tracker.actions';

export const AddMalTrackingCard = ({theme, setTrackSearchDialog}) => (
  <View style={styles.addCardContainer}>
    <Image
      source={require('../../../../../assets/mal.png')}
      style={styles.trackerIcon}
    />

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
        android_ripple={{color: theme.rippleColor, borderless: true}}
        onPress={() => setTrackSearchDialog(true)}
      >
        <Text
          style={{
            textAlignVertical: 'center',
            color: theme.colorAccent,
          }}
        >
          Add Tracking
        </Text>
      </Pressable>
    </View>
  </View>
);

export const MalTrackItemCard = ({
  trackItem,
  setTrackStatusDialog,
  setTrackChaptersDialog,
  setTrackScoreDialog,
  getStatus,
  theme,
}) => {
  const dispatch = useDispatch();

  return (
    <View style={[styles.cardContainer, {backgroundColor: theme.colorPrimary}]}>
      <View
        style={[styles.titleContainer, {borderBottomColor: theme.dividerColor}]}
      >
        <Image
          source={require('../../../../../assets/mal.png')}
          style={styles.trackerIcon}
        />
        <View style={styles.listItemContainer}>
          <Text style={[styles.listItem, {color: theme.textColorSecondary}]}>
            {trackItem.title}
          </Text>
          <IconButton
            icon="close"
            color={theme.textColorSecondary}
            size={21}
            onPress={() => dispatch(untrackNovel(trackItem.id))}
          />
        </View>
      </View>
      <View style={{height: 50, flexDirection: 'row'}}>
        <TouchableRipple
          style={[styles.listItemLeft, {borderRightColor: theme.dividerColor}]}
          borderless
          onPress={() => setTrackStatusDialog(true)}
          rippleColor={theme.rippleColor}
        >
          <Text style={[styles.listItem, {color: theme.textColorSecondary}]}>
            {getStatus(trackItem.my_list_status.status)}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={{flex: 1}}
          borderless
          onPress={() => setTrackChaptersDialog(true)}
          rippleColor={theme.rippleColor}
        >
          <Text style={[styles.listItem, {color: theme.textColorSecondary}]}>
            {`${trackItem.my_list_status.num_chapters_read}/${
              trackItem.num_chapters !== 0 ? trackItem.num_chapters : '-'
            }`}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={[styles.listItemRight, {borderLeftColor: theme.dividerColor}]}
          borderless
          onPress={() => setTrackScoreDialog(true)}
          rippleColor={theme.rippleColor}
        >
          <Text style={[styles.listItem, {color: theme.textColorSecondary}]}>
            {trackItem.my_list_status.score === 0
              ? '-'
              : trackItem.my_list_status.score}
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
    borderRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
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
