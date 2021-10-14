import React, {useState} from 'react';
import {View} from 'react-native';
import {Modal, Portal, Text, Button, Provider} from 'react-native-paper';

import * as WebBrowser from 'expo-web-browser';
import {
  myAnimeListConfig,
  getAccessToken,
  malTokenWatcher,
} from '../../services/Trackers/myAnimeList';
import {Appbar} from '../../components/Appbar';

import {useSelector, useDispatch} from 'react-redux';
import {List} from '../../components/List';
import {removeTracker, setTracker} from '../../redux/tracker/tracker.actions';

const TrackerScreen = ({navigation}) => {
  const theme = useSelector(state => state.settingsReducer.theme);
  const tracker = useSelector(state => state.trackerReducer.tracker);
  const dispatch = useDispatch();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <Provider>
      <Appbar title="Tacking" onBackAction={() => navigation.goBack()} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colorPrimaryDark,
          paddingVertical: 8,
        }}
      >
        <List.Section>
          <List.SubHeader theme={theme}>Services</List.SubHeader>
          <List.Item
            title="MyAnimeList"
            onPress={async () => {
              if (tracker) {
                showModal();
              } else {
                await WebBrowser.openAuthSessionAsync(
                  myAnimeListConfig.authUrl,
                  myAnimeListConfig.redirectUri,
                ).then(res => {
                  // console.log(res.type);
                  if (res.type === 'success') {
                    const {url} = res;

                    const codeExtractor = new RegExp(/[=]([^&]+)/);
                    let code = url.match(codeExtractor);

                    // console.log(code);

                    if (code) {
                      code = code[1];
                      getAccessToken(
                        code,
                        myAnimeListConfig.codeChallenge,
                      ).then(objects => {
                        // console.log(objects);
                        dispatch(setTracker(objects));
                      });
                    }
                  }
                });
              }
            }}
            right={tracker && 'check'}
            theme={theme}
          />
          {tracker && tracker.expires_in < new Date(Date.now()) && (
            <>
              <List.Divider theme={theme} />
              <List.SubHeader theme={theme}>Settings</List.SubHeader>
              <List.Item
                title="Revalidate MyAnimeList"
                onPress={() => {
                  const res = malTokenWatcher(tracker);
                  dispatch(setTracker(res));
                }}
                theme={theme}
              />
            </>
          )}
        </List.Section>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={{
              padding: 20,
              margin: 20,
              borderRadius: 6,
              backgroundColor: theme.colorPrimaryDark,
            }}
          >
            <Text
              style={{
                color: theme.textColorPrimary,
                fontSize: 18,
              }}
            >
              Log out from MyAnimeList?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                style={{marginTop: 30}}
                labelStyle={{
                  color: theme.colorAccent,
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
                onPress={hideModal}
              >
                Cancel
              </Button>
              <Button
                style={{marginTop: 30}}
                labelStyle={{
                  color: theme.colorAccent,
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
                onPress={() => {
                  dispatch(removeTracker());
                  hideModal();
                }}
              >
                Logout
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default TrackerScreen;
