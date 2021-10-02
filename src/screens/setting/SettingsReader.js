import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {Button} from 'react-native-paper';
import WebView from 'react-native-webview';
import {useDispatch} from 'react-redux';
import {TabView, TabBar} from 'react-native-tab-view';

import {Appbar} from '../../components/Appbar';
import ColorPickerModal from '../../components/ColorPickerModal';
import {Row, ScreenContainer} from '../../components/Common';
import {
  ToggleButton,
  ToggleColorButton,
} from '../../components/Common/ToggleButton';
import {List} from '../../components/List';

import {useReaderSettings, useSettings, useTheme} from '../../hooks/reduxHooks';
import {
  setAppSettings,
  setReaderSettings,
} from '../../redux/settings/settings.actions';
import {readerBackground, readerTextColor} from '../reader/utils/readerStyles';
import {useModal} from '../../hooks/useModal';

const FirstRoute = React.memo(({theme, dispatch, reader}) => {
  const presetThemes = [
    {
      value: 1,
      backgroundColor: '#000000',
      textColor: 'rgba(255,255,255,0.7)',
    },
    {value: 2, backgroundColor: '#FFFFFF', textColor: '#111111'},
    {value: 3, backgroundColor: '#F7DFC6', textColor: '#593100'},
    {value: 4, backgroundColor: '#292832', textColor: '#CCCCCC'},
    {value: 5, backgroundColor: '#2B2C30', textColor: '#CCCCCC'},
  ];

  const textAlignments = [
    {value: 'left', icon: 'format-align-left'},
    {value: 'center', icon: 'format-align-center'},
    {value: 'justify', icon: 'format-align-justify'},
    {value: 'right', icon: 'format-align-right'},
  ];

  const {autoScrollInterval = 10} = useSettings();

  /**
   * Reader Background Color Modal
   */
  const readerBackgroundModal = useModal();

  /**
   * Reader Text Color Modal
   */
  const [readerTextColorModal, setReaderTextColorModal] = useState(false);
  const showReaderTextColorModal = () => setReaderTextColorModal(true);
  const hideReaderTextColorModal = () => setReaderTextColorModal(false);

  const setReaderBackground = val => {
    dispatch(setReaderSettings('theme', val));
  };

  const setReaderTextColor = val => {
    dispatch(setReaderSettings('textColor', val || reader.textColor));
  };

  const [customHtmlCSS, setcustomHtmlCSS] = useState(reader.customCSS);

  return (
    <View style={{flex: 1}}>
      <ScrollView>
        <List.Section>
          <List.SubHeader theme={theme}>Preset</List.SubHeader>
          <View style={styles.pressableListItem}>
            <Text
              style={{
                color: theme.textColorPrimary,
                fontSize: 16,
              }}
            >
              Preset Themes
            </Text>
            <ScrollView
              style={{marginLeft: 16}}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <Row>
                {presetThemes.map(item => (
                  <ToggleColorButton
                    key={item.value}
                    selected={reader.theme === item.backgroundColor}
                    backgroundColor={item.backgroundColor}
                    textColor={item.textColor}
                    onPress={() => {
                      dispatch(
                        setReaderSettings('theme', item.backgroundColor),
                      );
                      dispatch(setReaderSettings('textColor', item.textColor));
                    }}
                  />
                ))}
              </Row>
            </ScrollView>
          </View>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Reader</List.SubHeader>
          <List.ColorItem
            title="Background Color"
            description={readerBackground(reader.theme).toUpperCase()}
            onPress={readerBackgroundModal.showModal}
            theme={theme}
          />
          <List.ColorItem
            title="Text Color"
            description={
              reader.textColor.toUpperCase() || readerTextColor(reader.theme)
            }
            onPress={showReaderTextColorModal}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Text</List.SubHeader>
          <Pressable style={styles.pressableListItem}>
            <View>
              <Text
                style={{
                  color: theme.textColorPrimary,
                  fontSize: 16,
                }}
              >
                Text Align
              </Text>
              <Text
                style={{
                  color: theme.textColorSecondary,
                  textTransform: 'capitalize',
                }}
              >
                {reader.textAlign}
              </Text>
            </View>
            <Row>
              {textAlignments.map(item => (
                <ToggleButton
                  key={item.value}
                  icon={item.icon}
                  onPress={() => {
                    dispatch(setReaderSettings('textAlign', item.value));
                  }}
                  selected={item.value === reader.textAlign}
                  theme={theme}
                />
              ))}
            </Row>
          </Pressable>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            Custom CSS (Only works in webview mode)
          </List.SubHeader>
          <View style={{paddingHorizontal: 16, paddingBottom: 8}}>
            <TextInput
              style={{
                color: theme.textColorPrimary,
                fontSize: 16,
              }}
              value={customHtmlCSS}
              onChangeText={text => setcustomHtmlCSS(text)}
              placeholderTextColor={theme.textColorSecondary}
              placeholder="Example: body { color: red; }"
              multiline={true}
            />
            <View style={{flexDirection: 'row-reverse'}}>
              <Button
                uppercase={false}
                color={theme.colorAccent}
                onPress={() =>
                  dispatch(setReaderSettings('customCSS', customHtmlCSS))
                }
              >
                Save
              </Button>
              <Button
                uppercase={false}
                color={theme.colorAccent}
                onPress={() => {
                  setcustomHtmlCSS('');
                  dispatch(setReaderSettings('customCSS', ''));
                }}
              >
                Clear
              </Button>
            </View>
          </View>
          <List.SubHeader theme={theme}>
            Auto scroll interval (in seconds)
          </List.SubHeader>
          <View style={{paddingHorizontal: 16, paddingBottom: 8}}>
            <TextInput
              style={{
                color: theme.textColorPrimary,
                fontSize: 16,
              }}
              defaultValue={autoScrollInterval.toString() ?? 10}
              keyboardType="numeric"
              onChangeText={text =>
                text !== '' &&
                dispatch(setAppSettings('autoScrollInterval', parseInt(text)))
              }
            />
          </View>
        </List.Section>
      </ScrollView>
      <ColorPickerModal
        title="Reader background color"
        modalVisible={readerBackgroundModal.visible}
        color={readerBackground(reader.theme)}
        hideModal={readerBackgroundModal.hideModal}
        theme={theme}
        onSubmit={setReaderBackground}
      />
      <ColorPickerModal
        title="Reader text color"
        modalVisible={readerTextColorModal}
        color={reader.textColor}
        hideModal={hideReaderTextColorModal}
        theme={theme}
        onSubmit={setReaderTextColor}
      />
    </View>
  );
});

const SecondRoute = React.memo(({reader}) => (
  <View style={{flex: 1}}>
    <WebView
      originWhitelist={['*']}
      style={{
        backgroundColor: readerBackground(reader.theme),
      }}
      source={{
        html: `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                        <style>
                        body {
                            color: ${reader.textColor};
                            text-align: ${reader.textAlign};
                            line-height: ${reader.lineHeight};
                            font-size: ${reader.textSize}px;
                            padding-top: 8px;
                            padding-bottom: 8px;
                            padding-left: ${reader.padding}%;
                            padding-right: ${reader.padding}%;
                            font-family: ${reader.fontFamily}; 
                        }
                        </style>
                        <style>
                          
                            ${reader.customCSS}
                           
                            @font-face {
                                font-family: ${reader.fontFamily};
                                src: url("file:///android_asset/fonts/${reader.fontFamily}.ttf");
                            }
                        </style>
                    </head>
                    <body>
                    <p>  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lobortis, diam sed malesuada bibendum, nulla libero scelerisque sapien, nec interdum nisl ipsum ac ipsum. In lacinia eros ut quam commodo, in finibus augue ultricies. Vestibulum ex purus, condimentum eget sem at, molestie semper mi. Mauris ac feugiat quam. Pellentesque sagittis bibendum nibh eu lacinia. Aenean rhoncus, velit sit amet mollis egestas, diam turpis ornare velit, a dictum elit velit in erat. Quisque luctus in sem a vulputate.
                    </p>
                    <p>  Pellentesque id tempus orci, non finibus tortor. Suspendisse in neque non eros eleifend hendrerit vitae a lacus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nunc interdum magna nulla, eget pharetra arcu dapibus eu. Pellentesque sed lectus sit amet sem porta lacinia. Curabitur consectetur dolor in nibh varius, ac placerat erat pellentesque. Proin in justo condimentum, fermentum lacus eget, ultrices ante. Fusce tempor blandit erat nec mollis. Vivamus in leo et nunc consectetur elementum nec ac lectus.
                    </p>  
                    <p>  In consectetur libero tempor metus interdum, sit amet viverra leo dapibus. Nullam tincidunt justo hendrerit lorem maximus, eu pretium erat fringilla. Nulla scelerisque leo at enim convallis, a elementum velit laoreet. Aliquam quis vestibulum quam. Morbi ut sollicitudin mi, et laoreet elit. Vivamus mattis, nulla at blandit sodales, lectus lacus luctus metus, non euismod neque urna vel nisl. Quisque vitae ante vitae orci tempus egestas quis eu nibh. Phasellus eget nulla non velit tincidunt fringilla eget nec libero. Morbi tempor erat quis rutrum condimentum.
                    </p>  
                    <p>  Cras sem magna, tempus sed urna eget, scelerisque tincidunt tortor. Cras euismod turpis libero, ut condimentum nulla ultrices id. Phasellus faucibus, elit ut imperdiet euismod, enim dui volutpat turpis, in tincidunt ex ligula non felis. Praesent erat erat, ultrices ut imperdiet sed, congue eu leo. Aliquam viverra fringilla ultrices. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ac malesuada massa. Cras eu augue in dui venenatis laoreet sit amet eget sem. Nullam malesuada sapien felis, et varius neque auctor eu.
                    </p>  
                    <p>  Sed vestibulum facilisis libero, in aliquet mauris lobortis et. In vitae lectus id risus cursus dictum at ac mi. Praesent ac lectus eget nunc elementum pellentesque. Ut at dui magna. Aliquam mattis posuere gravida. Morbi volutpat, dolor quis varius tincidunt, quam nulla vulputate libero, eu sagittis dui odio et magna. Sed luctus lectus ante, sit amet ultrices ligula convallis vitae. Sed efficitur libero nec quam porta, et fringilla turpis egestas. Nulla facilisi. Duis leo tellus, porta non enim eu, tincidunt cursus lorem.
                    </p>
                    </body>
                </html>
                `,
      }}
    />
  </View>
));

const ReaderSettings = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const reader = useReaderSettings();

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'first':
        return <FirstRoute dispatch={dispatch} theme={theme} reader={reader} />;
      case 'second':
        return <SecondRoute reader={reader} />;
    }
  };

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Settings'},
    {key: 'second', title: 'Preview'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.colorAccent}}
      style={{backgroundColor: theme.colorPrimary}}
      renderLabel={({route, focused, color}) => (
        <Text style={{color}}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.colorAccent}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <ScreenContainer theme={theme}>
      <Appbar
        title="Reader"
        onBackAction={navigation.goBack}
        style={{elevation: 0}}
      />

      <TabView
        navigationState={{index, routes}}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        swipeEnabled={false}
      />
    </ScreenContainer>
  );
};

export default ReaderSettings;

const styles = StyleSheet.create({
  pressableListItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetToggleButton: {
    marginLeft: 12,
    borderRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderWidth: 0,
  },
});
