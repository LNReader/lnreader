import React, {useState} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {Appbar as PaperAppbar, Menu} from 'react-native-paper';

import {clearDownloadQueue} from '../../../../redux/downloads/downloadsSlice';
import {useAppDispatch, useDownloadQueue} from '../../../../redux/hooks';
import {showToast} from '../../../../hooks/showToast';

import {ThemeType} from '../../../../theme/types';

interface DownloadsQueueAppbarProps {
  handleGoBack: () => void;
  theme: ThemeType;
}

const DownloadsQueueAppbar: React.FC<DownloadsQueueAppbarProps> = ({
  handleGoBack,
  theme,
}) => {
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const dispatch = useAppDispatch();

  const downloadQueue = useDownloadQueue();

  return (
    <PaperAppbar.Header
      style={{backgroundColor: theme.background}}
      statusBarHeight={StatusBar.currentHeight}
    >
      {handleGoBack && <PaperAppbar.BackAction onPress={handleGoBack} />}
      <PaperAppbar.Content
        title="Download queue"
        titleStyle={{color: theme.textColorPrimary}}
      />
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <PaperAppbar.Action
            icon="dots-vertical"
            color={theme.textColorPrimary}
            onPress={openMenu}
          />
        }
        contentStyle={{backgroundColor: theme.surface}}
      >
        <Menu.Item
          onPress={() => {
            if (downloadQueue.length > 0) {
              dispatch(clearDownloadQueue());
              showToast('Download queue cleared.');
            }
            closeMenu();
          }}
          title="Cancel downloads"
          titleStyle={{color: theme.textColorPrimary}}
        />
      </Menu>
    </PaperAppbar.Header>
  );
};

export default DownloadsQueueAppbar;

const styles = StyleSheet.create({});
