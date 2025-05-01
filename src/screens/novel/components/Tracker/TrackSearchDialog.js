import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import {  TextInput, TouchableRipple } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import color from 'color';
import { Button, Modal } from '@components';
import { getTracker } from '@hooks/persisted';
import { getString } from '@strings/translations';

const TrackSearchDialog = ({
  tracker,
  trackNovel,
  trackSearchDialog,
  setTrackSearchDialog,
  novelName,
  theme,
}) => {
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState(novelName);
  const [selectedNovel, setSelectedNovel] = useState();

  const getSearchResults = useCallback(async () => {
    setLoading(true);
    const trackerObj = getTracker(tracker.name);
    const results = await trackerObj.handleSearch(searchText, tracker.auth);
    setSearchResults(results);
    setLoading(false);
  }, [searchText, tracker.auth, tracker.name]);

  useEffect(() => {
    if (trackSearchDialog) {
      getSearchResults();
    }
  }, [getSearchResults, trackSearchDialog]);

  /**
   * @param {import('../../../../services/Trackers').SearchResult} item
   */
  const renderSearchResultCard = (item) => (
    <TouchableRipple
      style={[
        styles.searchResultCard,
        selectedNovel?.id === item.id && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
      key={item.id}
      onPress={() => setSelectedNovel(item)}
      rippleColor={color(theme.primary).alpha(0.12).string()}
      borderless
    >
      <>
        {selectedNovel?.id === item.id && (
          <MaterialCommunityIcons
            name="check-circle"
            color={theme.primary}
            size={24}
            style={styles.checkIcon}
          />
        )}
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <Text style={[styles.resultText, { color: theme.onSurface }]}>
          {item.title}
        </Text>
      </>
    </TouchableRipple>
  );

  return (
    <Modal
      visible={trackSearchDialog}
      onDismiss={() => setTrackSearchDialog(false)}
    >
      <TextInput
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onSubmitEditing={getSearchResults}
        textColor={theme.onSurface}
        theme={{
          colors: {
            primary: theme.primary,
            text: theme.onSurface,
          },
        }}
        style={styles.textInput}
        underlineColor={theme.outline}
        right={
          <TextInput.Icon
            color={theme.onSurfaceVariant}
            icon="close"
            onPress={() => setSearchText('')}
          />
        }
      />
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator color={theme.primary} size={45} style={styles.loader} />
        ) : (
          searchResults.map((result) => renderSearchResultCard(result))
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button onPress={() => setSelectedNovel(null)}>
          {getString('common.remove')}
        </Button>
        <View style={styles.actionButtons}>
          <Button onPress={() => setTrackSearchDialog(false)}>
            {getString('common.cancel')}
          </Button>
          <Button
            onPress={async () => {
              if (selectedNovel) {
                trackNovel(tracker, selectedNovel);
              }
              setTrackSearchDialog(false);
            }}
          >
            OK
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default TrackSearchDialog;

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  checkIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  coverImage: {
    borderRadius: 4,
    height: 150,
    width: 100,
  },
  loader: {
    margin: 16,
  },
  resultText: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 16,
    marginLeft: 20,
    padding: 8,
    paddingLeft: 0,
  },
  scrollView: {
    flexGrow: 1,
    marginVertical: 8,
    maxHeight: 500,
  },
  searchResultCard: {
    borderRadius: 4,
    flexDirection: 'row',
    margin: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
});
