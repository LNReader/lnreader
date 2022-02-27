import React from 'react';
import {Share, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Appbar as PaperAppbar} from 'react-native-paper';

import {CrossFadeView, IconButton} from '../../../../components';

import {ThemeType} from '../../../../theme/types';
import {isAbsoluteUrl} from '../../utils/isAbsoluteUrl';

interface ReaderAppbarProps {
  visible: boolean;
  novelName?: string;
  chapterName?: string;
  chapterUrl: string;
  theme: ThemeType;
}

const ReaderAppbar: React.FC<ReaderAppbarProps> = ({
  visible,
  novelName,
  chapterName,
  chapterUrl,
  theme,
}) => {
  const {goBack} = useNavigation();
  const backgroundColor = `${theme.background}E6`;

  return (
    <CrossFadeView
      style={styles.appbarContainer}
      active={!visible}
      animationDuration={150}
    >
      <View style={[styles.flex, {backgroundColor}]}>
        <PaperAppbar.Header style={styles.appbarHeader}>
          <IconButton
            name="arrow-left"
            onPress={goBack}
            color={theme.textColorPrimary}
            size={26}
            theme={theme}
          />
          <PaperAppbar.Content
            title={novelName || chapterName}
            titleStyle={{color: theme.textColorPrimary}}
            subtitle={novelName && chapterName}
            subtitleStyle={{color: theme.textColorSecondary}}
          />
          {isAbsoluteUrl(chapterUrl) ? (
            <PaperAppbar.Action
              icon="share-variant"
              size={24}
              onPress={() =>
                Share.share({
                  message: chapterUrl,
                })
              }
              color={theme.textColorPrimary}
            />
          ) : null}
        </PaperAppbar.Header>
      </View>
    </CrossFadeView>
  );
};

export default ReaderAppbar;

const styles = StyleSheet.create({
  appbarContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 1,
  },
  appbarHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    height: 64,
  },
  flex: {
    flex: 1,
  },
});
