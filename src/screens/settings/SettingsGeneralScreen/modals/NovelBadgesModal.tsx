import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { Checkbox } from '@components';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';

interface NovelBadgesModalProps {
  novelBadgesModalVisible: boolean;
  hideNovelBadgesModal: () => void;
  theme: ThemeColors;
}

const NovelBadgesModal: React.FC<NovelBadgesModalProps> = ({
  novelBadgesModalVisible,
  hideNovelBadgesModal,
  theme,
}) => {
  const {
    showDownloadBadges = true,
    showNumberOfNovels = false,
    showUnreadBadges = true,
    setLibrarySettings,
  } = useLibrarySettings();
  return (
    <Portal>
      <Modal
        visible={novelBadgesModalVisible}
        onDismiss={hideNovelBadgesModal}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {getString('libraryScreen.bottomSheet.display.badges')}
        </Text>
        <Checkbox
          label={getString('libraryScreen.bottomSheet.display.downloadBadges')}
          status={showDownloadBadges}
          onPress={() =>
            setLibrarySettings({
              showDownloadBadges: !showDownloadBadges,
            })
          }
          theme={theme}
        />
        <Checkbox
          label={getString('libraryScreen.bottomSheet.display.unreadBadges')}
          status={showUnreadBadges}
          onPress={() =>
            setLibrarySettings({
              showUnreadBadges: !showUnreadBadges,
            })
          }
          theme={theme}
        />
        <Checkbox
          label={getString('libraryScreen.bottomSheet.display.showNoOfItems')}
          status={showNumberOfNovels}
          onPress={() =>
            setLibrarySettings({
              showNumberOfNovels: !showNumberOfNovels,
            })
          }
          theme={theme}
        />
      </Modal>
    </Portal>
  );
};

export default NovelBadgesModal;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
  modalDescription: {
    paddingHorizontal: 24,
    fontSize: 16,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
});
