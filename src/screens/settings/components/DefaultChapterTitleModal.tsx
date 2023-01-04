import { Button, RadioButton } from '@components';
import { ButtonVariation } from '@components/Button/Button';
import { getString } from '@strings/translations';
import { MD3ThemeType } from '@theme/types';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { Dispatch } from 'redux';
import { Checkbox } from '../../../components/Checkbox/Checkbox';

import { setAppSettings } from '../../../redux/settings/settings.actions';

interface DefaultChapterTitleModalProps {
  theme: MD3ThemeType;
  defaultChapterPrefixStyle: Array<string>;
  displayModalVisible: boolean;
  defaultShowChapterPrefix: boolean;
  dispatch: Dispatch<any>;
  hideDisplayModal: () => void;
}

const DefaultChapterTitleModal: React.FC<DefaultChapterTitleModalProps> = ({
  theme,
  defaultChapterPrefixStyle,
  displayModalVisible,
  defaultShowChapterPrefix,
  dispatch,
  hideDisplayModal,
}) => {
  const styles = createStyles(theme);
  const [styleVolume, setStyleVolume] = useState(
    defaultChapterPrefixStyle[0].trim(),
  );
  const [styleChapter, setStyleChapter] = useState(
    defaultChapterPrefixStyle[1].trim(),
  );
  const [spaceBeforeChapterStyle, setSpaceBeforeChapterStyle] = useState(
    defaultChapterPrefixStyle[1].charAt(0) === ' ',
  );
  const [spaceBeforeNumber, setSpaceBeforeNumber] = useState(
    defaultChapterPrefixStyle[1].charAt(
      defaultChapterPrefixStyle[1].length - 1,
    ) === ' ' &&
      defaultChapterPrefixStyle[0].charAt(
        defaultChapterPrefixStyle[0].length - 1,
      ) === ' ',
  );
  const defaultArray1 = ['Volume ', ' Chapter '];
  const defaultArray2 = ['Vol. ', ' Ch. '];
  const [selection, setSelection] = useState(
    defaultArray1[0] === defaultChapterPrefixStyle[0] &&
      defaultArray2[1] === defaultChapterPrefixStyle[1]
      ? 1
      : defaultArray1[0] === defaultChapterPrefixStyle[0] &&
        defaultArray2[1] === defaultChapterPrefixStyle[1]
      ? 2
      : 3,
  );

  const dispatchAction = (val: Array<string>) => {
    dispatch(setAppSettings('defaultChapterPrefixStyle', val));
  };

  const handleSave = () => {
    if (selection === 1) {
      dispatchAction(defaultArray1);
    } else if (selection === 2) {
      dispatchAction(defaultArray2);
    } else {
      let ArrayRes: Array<string> = [styleVolume, styleChapter];
      if (spaceBeforeNumber) {
        ArrayRes[0] += ' ';
        ArrayRes[1] += ' ';
      }
      if (spaceBeforeChapterStyle) {
        ArrayRes[1] = ' ' + ArrayRes[1];
      }
      dispatchAction(ArrayRes);
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
        <Checkbox
          status={defaultShowChapterPrefix}
          label="Show Prefix"
          onPress={() =>
            dispatch(
              setAppSettings(
                'defaultShowChapterPrefix',
                !defaultShowChapterPrefix,
              ),
            )
          }
          theme={theme}
        />
        <View>
          <RadioButton
            style={styles.indent}
            disabled={!defaultShowChapterPrefix}
            status={selection === 1}
            label="Volume xx Chapter xx"
            onPress={() => {
              setSelection(1);
            }}
            theme={theme}
          />
          <RadioButton
            style={styles.indent}
            disabled={!defaultShowChapterPrefix}
            status={selection === 2}
            label="Vol. xx Ch. xx"
            onPress={() => {
              setSelection(2);
            }}
            theme={theme}
          />
          <RadioButton
            style={styles.indent}
            disabled={!defaultShowChapterPrefix}
            status={selection === 3}
            label="Custom"
            onPress={() => setSelection(3)}
            theme={theme}
          />
          {selection !== 3 ? null : (
            <>
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
            </>
          )}
          <View style={styles.customCSSButtons}>
            <Button
              theme={theme}
              onPress={handleSave}
              style={styles.marginLeftS}
              title={getString('common.save')}
              variation={ButtonVariation.OUTLINED}
            />

            {selection !== 3 ? null : (
              <Button
                theme={theme}
                onPress={() => {
                  setStyleChapter('');
                  setStyleVolume('');
                }}
                title={getString('common.clear')}
                variation={ButtonVariation.OUTLINED}
              />
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

export default DefaultChapterTitleModal;

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
