import React from 'react';

import { Button } from '@components/index';
import { View } from 'react-native';

type ButtonProperties = {
  up: {
    text: string;
    func: () => void;
  };
  down: {
    text: string;
    func: () => void;
  };
};
type Styles = { footer: object; button: object } & object;

export default function ListFooter({
  styles,
  buttonProperties,
}: {
  styles: Styles;
  buttonProperties: ButtonProperties;
}) {
  return (
    <View style={styles.footer}>
      <Button
        mode="contained"
        style={styles.button}
        title={buttonProperties.up.text}
        onPress={buttonProperties.up.func}
      />
      <Button
        mode="contained"
        style={styles.button}
        title={buttonProperties.down.text}
        onPress={buttonProperties.down.func}
      />
    </View>
  );
}
