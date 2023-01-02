import { RadioButton } from '@components';
import { MD3ThemeType } from '@theme/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
            status={Object.is(defaultChapterPrefixStyle[0], 'Volume ')}
            label="Volume xx Chapter xx"
            onPress={() => {
              dispatch(
                setAppSettings('defaultChapterPrefixStyle', [
                  'Volume ',
                  'Chapter ',
                ]),
              );
            }}
            theme={theme}
          />
          <RadioButton
            style={styles.indent}
            disabled={!defaultShowChapterPrefix}
            status={Object.is(defaultChapterPrefixStyle[0], 'Vol. ')}
            label="Vol. xx Ch. xx"
            onPress={() =>
              dispatch(
                setAppSettings('defaultChapterPrefixStyle', ['Vol. ', ' Ch. ']),
              )
            }
            theme={theme}
          />
          <RadioButton
            style={styles.indent}
            disabled={!defaultShowChapterPrefix}
            status={Object.is(defaultChapterPrefixStyle[0], '')}
            label="xx xx"
            onPress={() =>
              dispatch(setAppSettings('defaultChapterPrefixStyle', ['', ' ']))
            }
            theme={theme}
          />
        </View>
      </Modal>
    </Portal>
  );
};

export default DefaultChapterTitleModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
  indent: {
    paddingLeft: 56,
  },
});
