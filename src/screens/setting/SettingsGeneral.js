import React from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {Appbar} from '../../components/Appbar';
import {List} from '../../components/List';
import {ScreenContainer} from '../../components/Common';
import SwitchSetting from '../../components/Switch/Switch';
import DisplayModeModal from '../more/components/DisplayModeModal';
import GridSizeModal from '../more/components/GridSizeModal';

import {useSettings, useTheme} from '../../hooks/reduxHooks';
import {setAppSettings} from '../../redux/settings/settings.actions';
import {SHOW_LAST_UPDATE_TIME} from '../../redux/updates/updates.types';
import {useModal} from '../../hooks/useModal';

const GenralSettings = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const {displayMode, novelsPerRow} = useSelector(
    state => state.settingsReducer,
  );

  const {
    updateLibraryOnLaunch = false,
    downloadNewChapters = false,
    onlyUpdateOngoingNovels = false,
  } = useSettings();

  const {showLastUpdateTime = true} = useSelector(
    state => state.updatesReducer,
  );

  const displayModeLabel = () => {
    const label = {
      0: 'Compact Grid',
      1: 'Comfortable Grid',
      2: 'List',
      3: 'No Title Grid',
    };

    return label[displayMode] || label[0];
  };

  /**
   * Display Mode Modal
   */
  const displayModalRef = useModal();

  /**
   * Grid Size Modal
   */
  const gridSizeModalRef = useModal();

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="General" onBackAction={navigation.goBack} />
      <ScrollView contentContainerStyle={{paddingBottom: 32}}>
        <List.Section>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Display</List.SubHeader>
          <List.Item
            title="Display Mode"
            description={displayModeLabel()}
            onPress={displayModalRef.showModal}
            theme={theme}
          />
          <List.Item
            title="Items per row in library"
            description={`${novelsPerRow} items per row`}
            onPress={gridSizeModalRef.showModal}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Library</List.SubHeader>
          <SwitchSetting
            label="Update library on launch"
            value={updateLibraryOnLaunch}
            onPress={() =>
              dispatch(
                setAppSettings('updateLibraryOnLaunch', !updateLibraryOnLaunch),
              )
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Global update</List.SubHeader>
          <SwitchSetting
            label="Only update ongoing novels"
            value={onlyUpdateOngoingNovels}
            onPress={() =>
              dispatch(
                setAppSettings(
                  'onlyUpdateOngoingNovels',
                  !onlyUpdateOngoingNovels,
                ),
              )
            }
            theme={theme}
          />
          <SwitchSetting
            label="Show last update time"
            value={showLastUpdateTime}
            onPress={() =>
              dispatch({
                type: SHOW_LAST_UPDATE_TIME,
                payload: !showLastUpdateTime,
              })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Auto-download</List.SubHeader>
          <SwitchSetting
            label="Download new chapters"
            value={downloadNewChapters}
            onPress={() =>
              dispatch(
                setAppSettings('downloadNewChapters', !downloadNewChapters),
              )
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
      <DisplayModeModal
        displayMode={displayMode}
        displayModalVisible={displayModalRef.visible}
        hideDisplayModal={displayModalRef.hideModal}
        dispatch={dispatch}
        theme={theme}
      />
      <GridSizeModal
        dispatch={dispatch}
        novelsPerRow={novelsPerRow}
        gridSizeModalVisible={gridSizeModalRef.visible}
        hideGridSizeModal={gridSizeModalRef.hideModal}
        theme={theme}
      />
    </ScreenContainer>
  );
};

export default GenralSettings;
