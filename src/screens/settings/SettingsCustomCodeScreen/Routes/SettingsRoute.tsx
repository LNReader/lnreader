import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ReplaceItemModal from '../Modals/ReplaceItemModal';
import { List } from '@components';
import { useTheme } from '@hooks/persisted';

type SettingsRouteProps = {};

const defaultExtended = [false, false, false, false];

const SettingsRoute: React.FC<SettingsRouteProps> = ({}) => {
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
  );
};

export default SettingsRoute;

const styles = StyleSheet.create({
  paddingBottom: { paddingBottom: 40 },
});
