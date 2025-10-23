import React, { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

import { PluginItem } from '@plugins/types';
import { ThemeColors } from '@theme/types';
import { BrowseScreenProps } from '@navigators/types';
import { UseBooleanReturnType } from '@hooks';
import { PluginListItem } from './PluginListItem';
import { PluginListItemSkeleton } from './PluginListItemSkeleton';

interface DeferredPluginListItemProps {
  item: PluginItem;
  theme: ThemeColors;
  navigation: BrowseScreenProps['navigation'];
  settingsModal: UseBooleanReturnType;
  pluginIncompatibleModal: UseBooleanReturnType;
  navigateToSource: (plugin: PluginItem, showLatestNovels?: boolean) => void;
  setSelectedPluginId: React.Dispatch<React.SetStateAction<string>>;
}

export const DeferredPluginListItem = (props: DeferredPluginListItemProps) => {
  const [showReal, setShowReal] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() =>
      setShowReal(true),
    );
    return () => task.cancel();
  }, []);

  return showReal ? (
    <PluginListItem {...props} />
  ) : (
    <PluginListItemSkeleton item={props.item} theme={props.theme} />
  );
};
