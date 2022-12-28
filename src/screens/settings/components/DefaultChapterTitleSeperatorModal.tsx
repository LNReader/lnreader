import { Button, Checkbox } from '@components';
import { ButtonVariation } from '@components/Button/Button';
import { getString } from '@strings/translations';
import { MD3ThemeType } from '@theme/types';
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { Dispatch } from 'redux';

import { setAppSettings } from '../../../redux/settings/settings.actions';

interface DefaultChapterTitleSeperatorModalProps {
  theme: MD3ThemeType;
  defaultChapterTitleSeperator: string;
  displayModalVisible: boolean;
  dispatch: Dispatch<any>;
  hideDisplayModal: () => void;
}

const DefaultChapterTitleSeperatorModal: React.FC<DefaultChapterTitleSeperatorModalProps> =
  ({
    theme,
    defaultChapterTitleSeperator,
    displayModalVisible,
    dispatch,
    hideDisplayModal,
  }) => {
    const styles = createStyles(theme);
    const [text, setText] = useState(defaultChapterTitleSeperator.trim());
    const [spaceAroundSeparator, setSpaceAroundSeparator] = useState(
      defaultChapterTitleSeperator.charAt(0) === ' ' &&
        defaultChapterTitleSeperator.charAt(
          defaultChapterTitleSeperator.length - 1,
        ) === ' ',
    );

    const handleSave = () => {
      if (spaceAroundSeparator) {
        dispatch(
          setAppSettings('defaultChapterTitleSeperator', ' ' + text + ' '),
        );
      } else {
        dispatch(setAppSettings('defaultChapterTitleSeperator', text));
      }
      hideDisplayModal();
    };

    return (
      <Portal>
        <Modal
          visible={displayModalVisible}
          onDismiss={hideDisplayModal}
          contentContainerStyle={[
            styles.containerStyle,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          <View style={styles.autoScrollInterval}>
            <Text
              style={[styles.labelStyle, styles.paddingRightM]}
              numberOfLines={1}
            >
              Sepperator
            </Text>
            <TextInput
              style={[styles.labelStyle, styles.input]}
              value={text}
              onChangeText={t => {
                setText(t);
              }}
            />
          </View>
          <Checkbox
            status={spaceAroundSeparator}
            label="Place space around Seperator"
            onPress={() => {
              setSpaceAroundSeparator(!spaceAroundSeparator);
            }}
            theme={theme}
          />
          <View style={styles.customCSSButtons}>
            <Button
              theme={theme}
              onPress={handleSave}
              style={styles.marginLeftS}
              title={getString('common.save')}
              variation={ButtonVariation.OUTLINED}
            />
            <Button
              theme={theme}
              onPress={() => {
                setText('');
              }}
              title={getString('common.clear')}
              variation={ButtonVariation.OUTLINED}
            />
          </View>
        </Modal>
      </Portal>
    );
  };

export default DefaultChapterTitleSeperatorModal;
const createStyles = (theme: MD3ThemeType) => {
  return StyleSheet.create({
    containerStyle: {
      paddingVertical: 20,
      margin: 20,
      borderRadius: 6,
    },
    indent: {
      paddingLeft: 56,
    },

    autoScrollInterval: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    paddingRightM: {
      flex: 1,
      paddingRight: 16,
    },
    labelStyle: {
      fontSize: 16,
      color: theme.textColorPrimary,
    },
    input: {
      borderBottomColor: theme.textColorPrimary,
      borderBottomWidth: 1,
      flex: 1,
    },
    marginLeftS: {
      marginLeft: 8,
    },
    customCSSButtons: {
      flexDirection: 'row-reverse',
      marginHorizontal: 16,
      height: 40,
    },
  });
};
