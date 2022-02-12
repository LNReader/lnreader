import React from 'react';
import {StyleSheet} from 'react-native';

import {Portal, Modal} from 'react-native-paper';

import {RadioButton} from '../../../components/RadioButton/RadioButton';

import {setReaderSettings} from '../../../redux/settings/settings.actions';
import {fonts} from '../../../services/utils/constants';

const FontPickerModal = ({
  theme,
  dispatch,
  currentFont,
  hideModal,
  visible,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.containerStyle,
          {backgroundColor: theme.colorPrimaryDark},
        ]}
      >
        {fonts.map(item => (
          <RadioButton
            key={item.fontFamily}
            status={currentFont === item.fontFamily}
            onPress={() =>
              dispatch(setReaderSettings('fontFamily', item.fontFamily))
            }
            label={item.name}
            labelStyle={{fontFamily: item.fontFamily}}
            theme={theme}
          />
        ))}
      </Modal>
    </Portal>
  );
};

export default FontPickerModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
});
