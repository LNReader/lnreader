import { Appbar, List, SafeAreaView } from '@components';
import { useTheme } from '@hooks/persisted';
import { CustomCodeSettingsScreenProps } from '@navigators/types';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ReplaceItemModal from './Modals/ReplaceItemModal';

const defaultExtended = [false, false, false, false];

const SettingsCustomCode = ({ navigation }: CustomCodeSettingsScreenProps) => {
  const theme = useTheme();
  const [extended, setExtended] = React.useState(defaultExtended);

  const toggleExtended = React.useCallback(
    (index: number) => {
      const newExtended = [...defaultExtended];
      newExtended[index] = !extended[index];
      setExtended(newExtended);
    },
    [extended],
  );

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
            <ReplaceItemModal
              showReplace
              toggleList={() => toggleExtended(0)}
              listExpanded={extended[0]}
            />
            <ReplaceItemModal
              toggleList={() => toggleExtended(1)}
              listExpanded={extended[1]}
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
