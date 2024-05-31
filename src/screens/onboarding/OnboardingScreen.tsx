import { useTheme } from '@hooks/persisted';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { Button } from '@components';
import PickThemeStep from './PickThemeStep';
import { useState } from 'react';
import StorageStep from './StorageStep';

export default function OnboardingScreen() {
  const theme = useTheme();
  const steps = [PickThemeStep, StorageStep];
  const [step, setStep] = useState(0);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <Text>Hello!</Text>
      <Text>Youkoso jitsuryoku shijou shugi no kyoushitsu e</Text>
      {steps[step]()}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {step === 0 ? (
          <Button
            style={{ flex: 1 }}
            title="Next"
            mode="contained"
            onPress={() => setStep(1)}
          />
        ) : (
          <Button
            style={{ flex: 1 }}
            title="Previous"
            mode="contained"
            onPress={() => setStep(0)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
});
