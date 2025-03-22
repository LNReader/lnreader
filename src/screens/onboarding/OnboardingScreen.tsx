import { useTheme } from '@hooks/persisted';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from '@components';
import PickThemeStep from './PickThemeStep';
import { useState } from 'react';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { getString } from '@strings/translations';

enum OnboardingStep {
  PICK_THEME,
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const [step] = useState<OnboardingStep>(OnboardingStep.PICK_THEME);
  const renderStep = () => {
    switch (step) {
      case OnboardingStep.PICK_THEME:
        return <PickThemeStep />;
      default:
        return <PickThemeStep />;
    }
  };
  const renderHelptext = () => {
    switch (step) {
      case OnboardingStep.PICK_THEME:
        return getString('onboardingScreen.pickATheme');
      default:
        return <PickThemeStep />;
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../../assets/logo.png')}
        tintColor={theme.primary}
        style={{
          width: 90,
          height: 90,
        }}
      />
      <Text
        variant="headlineLarge"
        style={{
          fontWeight: '600',
          paddingBottom: 8,
          color: theme.onBackground,
        }}
      >
        {getString('onboardingScreen.welcome')}
      </Text>
      <Text
        style={{
          fontWeight: '600',
          paddingBottom: 8,
          color: theme.onBackground,
        }}
      >
        {renderHelptext()}
      </Text>
      <View
        style={[
          styles.stepContainer,
          { backgroundColor: theme.surfaceVariant },
        ]}
      >
        {renderStep()}
      </View>

      <Button
        title={getString('onboardingScreen.complete')}
        mode="contained"
        onPress={() => {
          MMKVStorage.set('IS_ONBOARDED', true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  stepContainer: {
    position: 'relative',
    flexBasis: '20%',
    flexGrow: 1,
    paddingTop: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
});
