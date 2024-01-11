import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal, Portal, TextInput } from 'react-native-paper';
import { updateNovelInfo } from '@database/queries/NovelQueries';

import { getString } from '@strings/translations';
import { Button } from '@components';
import { ThemeColors } from '@theme/types';
import { NovelInfo } from '@database/types';

interface EditInfoModalProps {
  theme: ThemeColors;
  hideModal: () => void;
  modalVisible: boolean;
  novel: NovelInfo;
  setNovel: (novel: NovelInfo | undefined) => void;
}

const EditInfoModal = ({
  theme,
  hideModal,
  modalVisible,
  novel,
  setNovel,
}: EditInfoModalProps) => {
  const [tag, setTag] = useState('');
  const removeTag = (t: string) => {
    let tags = novel.genres?.split(',').filter(item => item !== t);
    setNovel({ ...novel, genres: tags?.join(',') });
  };

  const status = ['Ongoing', 'Hiatus', 'Completed', 'Unknown', 'Cancelled'];

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          Edit info
        </Text>
        <View
          style={{
            marginVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.onSurfaceVariant }}>Status:</Text>
          <ScrollView
            style={{ marginLeft: 8 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {status.map((item, index) => (
              <View
                style={{ borderRadius: 8, overflow: 'hidden' }}
                key={'novelInfo' + index}
              >
                <Pressable
                  style={{
                    backgroundColor:
                      novel.status === item ? theme.rippleColor : 'transparent',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                  android_ripple={{
                    color: theme.rippleColor,
                  }}
                  onPress={() => setNovel({ ...novel, status: item })}
                >
                  <Text
                    style={{
                      color:
                        novel.status === item
                          ? theme.primary
                          : theme.onSurfaceVariant,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
        <TextInput
          placeholder={`Title: ${novel.name}`}
          style={{ fontSize: 14 }}
          numberOfLines={1}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          onChangeText={text => setNovel({ ...novel, name: text })}
          dense
        />
        <TextInput
          placeholder={`Author: ${novel.author}`}
          style={{ fontSize: 14 }}
          numberOfLines={1}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          onChangeText={text => setNovel({ ...novel, author: text })}
          dense
        />
        <TextInput
          placeholder={`Description: ${novel.summary?.substring(0, 16)}...`}
          style={{ fontSize: 14 }}
          numberOfLines={1}
          mode="outlined"
          onChangeText={text => setNovel({ ...novel, summary: text })}
          theme={{ colors: { ...theme } }}
          dense
        />

        <TextInput
          placeholder={'Add Tag'}
          style={{ fontSize: 14 }}
          numberOfLines={1}
          mode="outlined"
          onChangeText={text => setTag(text)}
          onSubmitEditing={() => {
            setNovel({ ...novel, genres: novel.genres + ',' + tag });
            setTag('');
          }}
          theme={{ colors: { ...theme } }}
          dense
        />

        {novel.genres !== undefined && novel.genres !== '' && (
          <FlatList
            contentContainerStyle={{ marginVertical: 8 }}
            horizontal
            data={novel.genres?.split(',')}
            keyExtractor={(item, index) => 'novelTag' + index}
            renderItem={({ item }) => (
              <GenreChip theme={theme} onPress={() => removeTag(item)}>
                {item}
              </GenreChip>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <View style={{ flexDirection: 'row-reverse' }}>
          <Button
            onPress={() => {
              updateNovelInfo(novel);
              hideModal();
            }}
          >
            {getString('common.save')}
          </Button>
          <Button onPress={hideModal}>{getString('common.cancel')}</Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default EditInfoModal;

const GenreChip = ({
  children,
  theme,
  onPress,
}: {
  children: React.ReactNode;
  theme: ThemeColors;
  onPress: () => void;
}) => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 16,
      marginVertical: 4,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.outline,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        color: theme.onSurfaceVariant,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
    <MaterialCommunityIcons
      name="close"
      color={theme.primary}
      size={18}
      onPress={onPress}
      style={{ marginLeft: 4 }}
    />
  </View>
);

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF0033',
    paddingTop: 8,
  },
  genreChip: {},
});
