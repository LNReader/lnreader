import { Button, Modal } from '@components/index';
import { useTheme } from '@hooks/persisted';
import { PluginItem } from '@plugins/types';
import { getString } from '@strings/translations';
import { Links } from '@utils/constants/links';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';

interface PluginIncompatibleModalProps {
  plugin: PluginItem;
  visible: boolean;
  onDismiss: () => void;
  update?: boolean;
}

const PluginIncompatibleModal: React.FC<PluginIncompatibleModalProps> = ({plugin, visible, onDismiss, update = false}) => {
  const theme = useTheme();
  
  const apiStr = (update ? plugin.updateApi : plugin.api) ?? '1.0.0';
  
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss}>
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString(update ? 'browseScreen.incompatible.updateTitle' : 'browseScreen.incompatible.installTitle')}
        </Text>
        <Text style={[styles.modalBodyText, { color: theme.onSurfaceVariant }]}>
          {getString(update ? 'browseScreen.incompatible.updateText1' : 'browseScreen.incompatible.installText1')}
          <Text style={{ fontWeight: 'bold' }}>"{plugin.name}"</Text>
          {getString('browseScreen.incompatible.text2')}
          <Text style={{ fontWeight: 'bold' }}>{apiStr}</Text>
          {getString('browseScreen.incompatible.text3')}
        </Text>
        {Links.pluginCompatibilityTable && <Text style={[styles.modalBodyText,{ color: theme.onSurfaceVariant, marginTop: 8 }]}>
          {getString('browseScreen.incompatible.text4')}
          <Text style={[{ color: theme.primary, textDecorationLine: 'underline' }]}
            onPress={() => Links.pluginCompatibilityTable &&
              Linking.openURL(Links.pluginCompatibilityTable)}>{getString('browseScreen.incompatible.text5')}
          </Text>
          {getString('browseScreen.incompatible.text6')}
        </Text>}
        <View style={styles.customCSSButtons}>
          <Button
            onPress={onDismiss}
            style={styles.button}
            title={"Close"}
            mode="contained"
          />
        </View>
      </Modal>
    </Portal>
  );
}

export default PluginIncompatibleModal;


const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 16,
  },
  customCSSButtons: {
    flexDirection: 'row',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  modalBodyText: {
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 16,
  },
});