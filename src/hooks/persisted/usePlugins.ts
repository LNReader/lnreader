import { locale } from 'expo-localization';
import { Language, languagesMapping } from '@utils/constants/languages';
import { useMMKVObject } from 'react-native-mmkv';
import { PluginItem } from '@plugins/types';
import {
  fetchPlugins,
  installPlugin as _install,
  uninstallPlugin as _uninstall,
  updatePlugin as _update,
} from '@plugins/pluginManager';
import { newer } from '@utils/compareVersion';
import { MMKVStorage, getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { useCallback } from 'react';
import { getString } from '@strings/translations';

export const AVAILABLE_PLUGINS = 'AVAILABLE_PLUGINS';
export const INSTALLED_PLUGINS = 'INSTALL_PLUGINS';
export const LANGUAGES_FILTER = 'LANGUAGES_FILTER';
export const LAST_USED_PLUGIN = 'LAST_USED_PLUGIN';
export const FILTERED_AVAILABLE_PLUGINS = 'FILTERED_AVAILABLE_PLUGINS';
export const FILTERED_INSTALLED_PLUGINS = 'FILTERED_INSTALLED_PLUGINS';

const defaultLang = languagesMapping[locale.split('-')[0]] || 'English';

export type PluginsMap = Record<Language, PluginItem[] | undefined>;

export default function usePlugins() {
  const [lastUsedPlugin, setLastUsedPlugin] =
    useMMKVObject<PluginItem>(LAST_USED_PLUGIN);
  const [languagesFilter = [defaultLang], setLanguagesFilter] =
    useMMKVObject<Language[]>(LANGUAGES_FILTER);
  const [
    filteredAvailablePlugins = {} as PluginsMap,
    setFilteredAvailablePlugins,
  ] = useMMKVObject<PluginsMap>(FILTERED_AVAILABLE_PLUGINS);
  const [filteredInstalledPlugins = [], setFilteredInstalledPlugins] =
    useMMKVObject<PluginItem[]>(FILTERED_INSTALLED_PLUGINS);
  /**
   * @param filter
   * We cant use the languagesFilter directly because it is updated only after component's lifecycle end.
   * And toggleLanguagFilter triggers filterPlugins before lifecycle end.
   */
  const filterPlugins = useCallback((filter: Language[]) => {
    const installedPlugins =
      getMMKVObject<PluginItem[]>(INSTALLED_PLUGINS) || [];
    const availablePlugins =
      getMMKVObject<PluginsMap>(AVAILABLE_PLUGINS) || ({} as PluginsMap);
    setFilteredInstalledPlugins(
      installedPlugins.filter(plg => filter.includes(plg.lang)),
    );
    setFilteredAvailablePlugins(
      filter.reduce((pre, cur) => {
        pre[cur] = availablePlugins[cur];
        return pre;
      }, {} as PluginsMap),
    );
  }, []);

  const refreshPlugins = useCallback(() => {
    const installedPlugins =
      getMMKVObject<PluginItem[]>(INSTALLED_PLUGINS) || [];
    return fetchPlugins().then(fetchedPluginsMap => {
      for (const key in fetchedPluginsMap) {
        const lang = key as Language;
        fetchedPluginsMap[lang] = fetchedPluginsMap[lang].filter(plg => {
          const finded = installedPlugins.find(v => v.id === plg.id);
          if (finded) {
            if (newer(plg.version, finded.version)) {
              finded.hasUpdate = true;
              finded.iconUrl = plg.iconUrl;
              finded.url = plg.url;
              if (finded.id === lastUsedPlugin?.id) {
                setLastUsedPlugin(finded);
              }
            }
            return false;
          }
          return true;
        });
        setMMKVObject(INSTALLED_PLUGINS, installedPlugins);
        setMMKVObject(AVAILABLE_PLUGINS, fetchedPluginsMap);
        filterPlugins(languagesFilter);
      }
    });
  }, [languagesFilter]);

  const toggleLanguageFilter = (lang: Language) => {
    const newFilter = languagesFilter.includes(lang)
      ? languagesFilter.filter(l => l !== lang)
      : [...languagesFilter, lang];
    setLanguagesFilter(newFilter);
    filterPlugins(newFilter);
  };

  /**
   * Variable scope naming
   * plugin: parameter
   * _plg: value returned by pluginManager functions
   * plg: parameter in JS class method callback (.map, .reducer, ...)
   */

  const installPlugin = (plugin: PluginItem) => {
    return _install(plugin.url).then(_plg => {
      if (_plg) {
        const installedPlugins =
          getMMKVObject<PluginItem[]>(INSTALLED_PLUGINS) || [];
        const availablePlugins =
          getMMKVObject<PluginsMap>(AVAILABLE_PLUGINS) || ({} as PluginsMap);
        availablePlugins[plugin.lang] = availablePlugins[plugin.lang]?.filter(
          plg => plg.id !== plugin.id,
        );

        const actualPlugin: PluginItem = {
          ...plugin,
          version: _plg.version,
        };
        // safe
        if (!installedPlugins.some(plg => plg.id === plugin.id)) {
          setMMKVObject(INSTALLED_PLUGINS, [...installedPlugins, actualPlugin]);
        }
        setMMKVObject(AVAILABLE_PLUGINS, availablePlugins);
        filterPlugins(languagesFilter);
      } else {
        throw new Error(
          getString('browseScreen.installFailed', { name: plugin.name }),
        );
      }
    });
  };

  const uninstallPlugin = (plugin: PluginItem) => {
    return _uninstall(plugin).then(() => {
      if (lastUsedPlugin?.id === plugin.id) {
        MMKVStorage.delete(LAST_USED_PLUGIN);
      }
      const installedPlugins =
        getMMKVObject<PluginItem[]>(INSTALLED_PLUGINS) || [];
      const availablePlugins =
        getMMKVObject<PluginsMap>(AVAILABLE_PLUGINS) || ({} as PluginsMap);

      // safe
      if (!availablePlugins[plugin.lang]?.some(_plg => _plg.id === plugin.id)) {
        availablePlugins[plugin.lang] = [
          ...(availablePlugins[plugin.lang] || []),
          plugin,
        ];
        setMMKVObject(AVAILABLE_PLUGINS, availablePlugins);
      }
      setMMKVObject(
        INSTALLED_PLUGINS,
        installedPlugins.filter(plg => plg.id !== plugin.id),
      );
      filterPlugins(languagesFilter);
    });
  };

  const updatePlugin = (plugin: PluginItem) => {
    return _update(plugin).then(_plg => {
      if (plugin.version === _plg?.version) {
        throw new Error(getString('browseScreen.tryAgain'));
      }
      if (_plg) {
        const installedPlugins =
          getMMKVObject<PluginItem[]>(INSTALLED_PLUGINS) || [];
        setMMKVObject<PluginItem[]>(
          INSTALLED_PLUGINS,
          installedPlugins.map(plg => {
            if (plugin.id !== plg.id) {
              return plg;
            }
            const newPlugin: PluginItem = {
              ...plugin,
              site: _plg.site,
              name: _plg.name,
              version: _plg.version,
              hasUpdate: false,
            };
            if (newPlugin.id === lastUsedPlugin?.id) {
              setLastUsedPlugin(newPlugin);
            }
            return newPlugin;
          }),
        );
        filterPlugins(languagesFilter);
        return _plg.version;
      } else {
        throw Error(getString('browseScreen.updateFailed'));
      }
    });
  };

  return {
    filteredAvailablePlugins,
    filteredInstalledPlugins,
    lastUsedPlugin,
    languagesFilter,
    setLastUsedPlugin,
    refreshPlugins,
    toggleLanguageFilter,
    installPlugin,
    uninstallPlugin,
    updatePlugin,
  };
}
