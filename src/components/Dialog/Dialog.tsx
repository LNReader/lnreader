import React, {ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {Dialog as PaperDialog, Portal} from 'react-native-paper';

import {ThemeType} from '../../theme/types';

interface DialogProps {
  visible: boolean;
  theme: ThemeType;
  children: ReactNode;
}

const Container = (props: DialogProps) => (
  <Portal>
    <PaperDialog
      visible={props.visible}
      style={[styles.dialogContainer, {backgroundColor: props.theme.surface}]}
    >
      {props.children}
    </PaperDialog>
  </Portal>
);

const Title = ({title, theme}: {title: string; theme: ThemeType}) => (
  <PaperDialog.Title
    style={[styles.dialogTitle, {color: theme.textColorPrimary}]}
  >
    {title}
  </PaperDialog.Title>
);

const Dialog = {Container, Title};

export default Dialog;

const styles = StyleSheet.create({
  dialogContainer: {
    borderRadius: 6,
  },
  dialogTitle: {
    letterSpacing: 0,
    fontSize: 16,
  },
});
