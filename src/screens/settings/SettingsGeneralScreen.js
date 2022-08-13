import React from 'react';
import { ScrollView } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { Appbar } from '../../components/Appbar';
import { List } from '../../components/List';
import { ScreenContainer } from '../../components/Common';
import SwitchSetting from '../../components/Switch/Switch';
import DisplayModeModal from '../more/components/DisplayModeModal';
import GridSizeModal from '../more/components/GridSizeModal';

import { useSettings, useTheme } from '../../hooks/reduxHooks';
import { setAppSettings } from '../../redux/settings/settings.actions';
import { SHOW_LAST_UPDATE_TIME } from '../../redux/updates/updates.types';
import { useModal } from '../../hooks/useModal';
import DefaultChapterSortModal from './components/DefaultChapterSortModal';
import {
  DisplayModes,
  displayModesList,
} from '@screens/library/constants/constants';
import { useLibrarySettings } from '@hooks/useSettings';

const GenralSettings = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { displayMode = DisplayModes.Comfortable, novelsPerRow = 3 } =
    useLibrarySettings();

  const {
    updateLibraryOnLaunch = false,
    downloadNewChapters = false,
    onlyUpdateOngoingNovels = false,
    defaultChapterSort = 'ORDER BY chapterId ASC',
    refreshNovelMetadata = false,
    disableHapticFeedback = false,
  } = useSettings();

  const { showLastUpdateTime = true } = useSelector(
    state => state.updatesReducer,
  );

  /**
   * Display Mode Modal
   */
  const displayModalRef = useModal();

  /**
   * Grid Size Modal
   */
  const gridSizeModalRef = useModal();

  const defaultChapterSortModal = useModal();

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="General" onBackAction={navigation.goBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <List.Section>
          <List.SubHeader theme={theme}>Display</List.SubHeader>
          <List.Item
            title="Display Mode"
            description={displayModesList[displayMode].label}
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
          <List.SubHeader theme={theme}>Novel</List.SubHeader>
          <List.Item
            title="Default chapter sort"
            description={`By source ${
              defaultChapterSort === 'ORDER BY chapterId ASC'
                ? '(Ascending)'
                : '(Descending)'
            }`}
            onPress={defaultChapterSortModal.showModal}
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
            label="Automatically refresh metadata"
            description="Check for new cover and details when updating library"
            value={refreshNovelMetadata}
            onPress={() =>
              dispatch(
                setAppSettings('refreshNovelMetadata', !refreshNovelMetadata),
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
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>General</List.SubHeader>
          <SwitchSetting
            label="Disable haptic feedback"
            value={disableHapticFeedback}
            onPress={() =>
              dispatch(
                setAppSettings('disableHapticFeedback', !disableHapticFeedback),
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
        theme={theme}
      />
      <DefaultChapterSortModal
        defaultChapterSort={defaultChapterSort}
        displayModalVisible={defaultChapterSortModal.visible}
        hideDisplayModal={defaultChapterSortModal.hideModal}
        dispatch={dispatch}
        theme={theme}
      />
      <GridSizeModal
        novelsPerRow={novelsPerRow}
        gridSizeModalVisible={gridSizeModalRef.visible}
        hideGridSizeModal={gridSizeModalRef.hideModal}
        theme={theme}
      />
    </ScreenContainer>
  );
};

export default GenralSettings;
