import { Button, Checkbox } from '@components';
import { ButtonVariation } from '@components/Button/Button';
import { getString } from '@strings/translations';
import { MD3ThemeType } from '@theme/types';
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

interface ChapterTitleStyleModalProps {
  theme: MD3ThemeType;
  status: Array<string>;
  displayModalVisible: boolean;
  dispatchAction: (val: Array<string>) => void;
  hideDisplayModal: () => void;
}

const ChapterTitleStyleModal: React.FC<ChapterTitleStyleModalProps> = ({
  theme,
  status,
  displayModalVisible,
  dispatchAction,
  hideDisplayModal,
}) => {
  const styles = createStyles(theme);
  const [styleVolume, setStyleVolume] = useState(status[0].trim());
  const [styleChapter, setStyleChapter] = useState(status[1].trim());
  const [spaceBeforeChapterStyle, setSpaceBeforeChapterStyle] = useState(
    status[1].charAt(0) === ' ',
  );
  const [spaceBeforeNumber, setSpaceBeforeNumber] = useState(
    status[1].charAt(status[1].length - 1) === ' ' &&
      status[0].charAt(status[0].length - 1) === ' ',
  );

  const handleSave = () => {
    let ArrayRes: Array<string> = [styleVolume, styleChapter];
    if (spaceBeforeNumber) {
      ArrayRes[0] += ' ';
      ArrayRes[1] += ' ';
    }
    if (spaceBeforeChapterStyle) {
      ArrayRes[1] = ' ' + ArrayRes[1];
    }
    dispatchAction(ArrayRes);

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
        <View style={styles.row}>
          <Text
            style={[styles.labelStyle, styles.paddingRightM]}
            numberOfLines={1}
          >
            Volume
          </Text>
          <TextInput
            style={[styles.labelStyle, styles.input]}
            value={styleVolume}
            onChangeText={t => {
              setStyleVolume(t);
            }}
          />
        </View>
        <View style={styles.row}>
          <Text
            style={[styles.labelStyle, styles.paddingRightM]}
            numberOfLines={1}
          >
            Chapter
          </Text>
          <TextInput
            style={[styles.labelStyle, styles.input]}
            value={styleChapter}
            onChangeText={t => {
              setStyleChapter(t);
            }}
          />
        </View>
        <Checkbox
          status={spaceBeforeChapterStyle}
          label="Place space between Volume and Chapter"
          onPress={() => {
            setSpaceBeforeChapterStyle(!spaceBeforeChapterStyle);
          }}
          theme={theme}
        />
        <Checkbox
          status={spaceBeforeNumber}
          label="Place space before Number"
          onPress={() => {
            setSpaceBeforeNumber(!spaceBeforeNumber);
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
              setStyleChapter('');
              setStyleVolume('');
            }}
            title={getString('common.clear')}
            variation={ButtonVariation.OUTLINED}
          />
        </View>
      </Modal>
    </Portal>
  );
};

export default ChapterTitleStyleModal;
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

    row: {
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
