import { Appbar, List, Modal, SafeAreaView } from '@components';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import { CustomCodeSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Portal } from 'react-native-paper';
import ReplaceItemModal from './Modals/ReplaceItemModal';

const SettingsCustomCode = ({ navigation }: CustomCodeSettingsScreenProps) => {
  const theme = useTheme();

  const replaceModal = useBoolean(false);
  return (
    <>
      <SafeAreaView excludeTop>
        <Appbar
          title={'Custom Code'}
          handleGoBack={() => navigation.goBack()}
          theme={theme}
        />
        <ScrollView style={styles.paddingBottom}>
          <List.Section>
            <List.SubHeader theme={theme}>{'Text manipulation'}</List.SubHeader>
            <ReplaceItemModal />
            <List.Item
              title={'Remove'}
              description={'Remove text'}
              theme={theme}
              right="plus"
            />
            <List.Divider theme={theme} />
            <List.SubHeader theme={theme}>{'Code Snippets'}</List.SubHeader>
          </List.Section>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default SettingsCustomCode;

const styles = StyleSheet.create({
  paddingBottom: { paddingBottom: 40 },
});
