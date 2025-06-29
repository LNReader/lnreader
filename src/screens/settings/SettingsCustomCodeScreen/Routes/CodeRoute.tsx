import { Button } from '@components';
import { Row } from '@components/Common';
import { ToggleButton } from '@components/Common/ToggleButton';
import TextInput from '@components/TextInput/TextInput';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { useSettings, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import CodeInput from '../Components/CodeInput';
import { showToast } from '@utils/showToast';

type CodeRouteProps = {
  language?: 'css' | 'js';
  snippetIndex?: number;
  jumpTo: (key: string) => void;
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const CodeRoute = ({
  language: dLang,
  snippetIndex,
  jumpTo,
}: CodeRouteProps) => {
  const theme = useTheme();
  const { codeSnippetsJS, codeSnippetsCSS, setSettings } = useSettings();
  const [error, setError] = React.useState({ title: false, code: false });
  const [language, setLanguage] = React.useState(dLang ?? 'js');

  const snippets = language === 'js' ? codeSnippetsJS : codeSnippetsCSS;
  const snippet = snippetIndex === undefined ? null : snippets[snippetIndex];

  const [title, setTitle] = React.useState<string>(snippet?.name ?? '');
  const [code, setCode] = React.useState<string>(snippet?.code ?? '');

  const { height: keyboardHeight } = useAnimatedKeyboard();

  const ScrollViewRef = React.useRef<ScrollView>(null);

  const maxHeightScrollView = useAnimatedStyle(() => {
    return {
      maxHeight: WINDOW_HEIGHT - keyboardHeight.value - 26,
    };
  });

  const colors = React.useMemo(
    () => ({
      colors: theme,
    }),
    [theme],
  );

  const save = React.useCallback(() => {
    setError({ title: false, code: false });
    if (!code.trim() || !title.trim()) {
      setError({ title: !title.trim(), code: !code.trim() });
      return;
    }
    if (
      dLang !== undefined &&
      dLang === language &&
      snippetIndex !== undefined
    ) {
      snippets[snippetIndex].name = title;
      snippets[snippetIndex].code = code;
      setSettings({
        [dLang === 'js' ? 'codeSnippetsJS' : 'codeSnippetsCSS']: snippets,
      });
      return;
    }
    snippets.push({
      name: title,
      code,
      active: true,
      lang: language,
    });
    setSettings({
      [language === 'js' ? 'codeSnippetsJS' : 'codeSnippetsCSS']: snippets,
    });
    // TODO: Change placeholder
    showToast(getString('novelScreen.coverSaved'));
    jumpTo('second');
  }, [dLang, language, snippetIndex, snippets, title, code, setSettings]);

  return (
    <AnimatedScrollView
      ref={ScrollViewRef}
      style={[styles.container, maxHeightScrollView]}
    >
      <Row verticalSpacing={8}>
        <Text theme={colors} style={styles.text}>
          {'Select CSS or JS'}
        </Text>
        <ToggleButton
          theme={theme}
          icon="language-css3"
          selected={language === 'css'}
          onPress={() => setLanguage('css')}
          disabled={dLang !== undefined && snippetIndex !== undefined}
        />
        <ToggleButton
          theme={theme}
          icon="language-javascript"
          selected={language === 'js'}
          onPress={() => setLanguage('js')}
          disabled={dLang !== undefined && snippetIndex !== undefined}
        />
      </Row>
      <TextInput
        placeholder={'Snippet name'}
        defaultValue={title}
        onChangeText={setTitle}
        style={styles.snippetName}
        error={error.title}
      />
      <CodeInput
        language={language}
        code={code}
        setCode={setCode}
        error={error.code}
      />
      <Row verticalSpacing={8}>
        <Button
          style={styles.button}
          title={getString('readerSettings.openJSFile')}
          mode="outlined"
        />
        <Button
          style={styles.button}
          title={getString('common.save')}
          mode="contained"
          onPress={save}
        />
      </Row>
    </AnimatedScrollView>
  );
};

export default React.memo(CodeRoute);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
  },
  button: {
    marginHorizontal: 8,
    flexBasis: '40%',
    flex: 1,
  },
  snippetName: {
    marginTop: 8,
    marginBottom: 16,
  },
  fakeTextInput: {
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 1,
    marginVertical: 2,
  },
  topField: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    flexGrow: 1,
  },
  codeField: {
    verticalAlign: 'top',
    flexGrow: 1,
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  bottomField: {
    flexGrow: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
});
