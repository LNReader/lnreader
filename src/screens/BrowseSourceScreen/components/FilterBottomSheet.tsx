import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import BottomSheet from '@components/BottomSheet/BottomSheet';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { useTheme } from '@hooks/persisted';
import {
  FilterTypes,
  FilterToValues,
  Filters,
} from '@plugins/types/filterTypes';
import { FlatList } from 'react-native-gesture-handler';
import { Button } from '@components/index';
import { Checkbox } from '@components/Checkbox/Checkbox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useBoolean } from '@hooks';
import { Menu, TextInput, overlay } from 'react-native-paper';
import { getValueFor } from './filterUtils';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';

const insertOrRemoveIntoArray = (array: string[], val: string): string[] =>
  array.indexOf(val) > -1 ? array.filter(ele => ele !== val) : [...array, val];

type SelectedFilters = FilterToValues<Filters>;

interface FilterItemProps {
  theme: ThemeColors;
  filter: Filters[string];
  filterKey: keyof Filters;
  selectedFilters: SelectedFilters;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilters>>;
}

const FilterItem: React.FC<FilterItemProps> = ({
  theme,
  filter,
  filterKey,
  selectedFilters,
  setSelectedFilters,
}) => {
  const {
    value: isVisible,
    toggle: toggleCard,
    setFalse: closeCard,
  } = useBoolean();
  const { width: screenWidth } = useWindowDimensions();
  if (filter.type === FilterTypes.Picker) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View style={styles.pickerContainer}>
        <Menu
          style={{ flex: 1 }}
          visible={isVisible}
          anchor={
            <Pressable
              style={{ flex: 1, width: screenWidth - 48 }}
              onPress={toggleCard}
            >
              <TextInput
                mode="outlined"
                label={
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isVisible ? theme.primary : theme.onSurface,
                        backgroundColor: theme.surface,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                }
                value={value || 'whatever'}
                editable={false}
                outlineColor={isVisible ? theme.primary : theme.outline}
                textColor={isVisible ? theme.primary : theme.outline}
                right={
                  <TextInput.Icon
                    icon={isVisible ? 'chevron-up' : 'chevron-down'}
                    color={isVisible ? theme.primary : theme.outline}
                  />
                }
              />
            </Pressable>
          }
          onDismiss={closeCard}
        >
          {filter.options.map(val => {
            return (
              <Menu.Item
                key={val.label}
                title={val.label}
                onPress={() => {
                  closeCard();
                  setSelectedFilters(prevFilters => ({
                    ...prevFilters,
                    [filterKey]: { value: val.value, type: FilterTypes.Picker },
                  }));
                }}
              />
            );
          })}
        </Menu>
      </View>
    );
  }
  if (filter.type === FilterTypes.CheckboxGroup) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View>
        <Pressable
          style={styles.checkboxHeader}
          onPress={toggleCard}
          android_ripple={{ color: theme.rippleColor }}
        >
          <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {filter.label}
          </Text>
          <MaterialCommunityIcons
            name={isVisible ? 'chevron-up' : 'chevron-down'}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible
          ? filter.options.map(val => {
              return (
                <Checkbox
                  key={val.label}
                  label={val.label}
                  theme={theme}
                  status={value.includes(val.value)}
                  onPress={() =>
                    setSelectedFilters(prevFilters => ({
                      ...prevFilters,
                      [filterKey]: {
                        type: FilterTypes.CheckboxGroup,
                        value: insertOrRemoveIntoArray(value, val.value),
                      },
                    }))
                  }
                />
              );
            })
          : null}
      </View>
    );
  }
  if (filter.type === FilterTypes.ExcludableCheckboxGroup) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View>
        <Pressable
          style={styles.checkboxHeader}
          onPress={toggleCard}
          android_ripple={{ color: theme.rippleColor }}
        >
          <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {filter.label}
          </Text>
          <MaterialCommunityIcons
            name={isVisible ? 'chevron-up' : 'chevron-down'}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible
          ? filter.options.map(val => {
              return (
                <Checkbox
                  key={val.label}
                  label={val.label}
                  theme={theme}
                  status={
                    value.include?.includes(val.value)
                      ? true
                      : value.exclude?.includes(val.value)
                      ? 'indeterminate'
                      : false
                  }
                  onPress={() => {
                    if (value.exclude?.includes(val.value)) {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [...(value.include || [])],
                              exclude: [
                                ...(value.exclude?.filter(
                                  f => f !== val.value,
                                ) || []),
                              ],
                            },
                          },
                        };
                      });
                    } else if (value.include?.includes(val.value)) {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [
                                ...(value.include?.filter(
                                  f => f !== val.value,
                                ) || []),
                              ],
                              exclude: [...(value.exclude || []), val.value],
                            },
                          },
                        };
                      });
                    } else {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [...(value.include || []), val.value],
                              exclude: value.exclude,
                            },
                          },
                        };
                      });
                    }
                  }}
                />
              );
            })
          : null}
      </View>
    );
  }
  return <></>;
};

interface BottomSheetProps {
  filterSheetRef: React.RefObject<BottomSheetModal> | null;
  filters: Filters;
  setFilters: (filters?: SelectedFilters) => void;
  clearFilters: (filters: Filters) => void;
}

const FilterBottomSheet: React.FC<BottomSheetProps> = ({
  filters,
  filterSheetRef,
  clearFilters,
  setFilters,
}) => {
  const theme = useTheme();

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilters>(filters);

  return (
    <BottomSheet bottomSheetRef={filterSheetRef} snapPoints={[400, 600]}>
      <BottomSheetView
        style={[
          styles.container,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <BottomSheetView
          style={[styles.buttonContainer, { borderBottomColor: theme.outline }]}
        >
          <Button
            title={getString('common.reset')}
            onPress={() => {
              setSelectedFilters(filters);
              clearFilters(filters);
            }}
          />
          <Button
            title={getString('common.filter')}
            textColor={theme.onPrimary}
            onPress={() => {
              setFilters(selectedFilters);
              filterSheetRef?.current?.close();
            }}
            mode="contained"
          />
        </BottomSheetView>
        <FlatList
          contentContainerStyle={styles.filterContainer}
          data={filters && Object.entries(filters)}
          keyExtractor={item => 'filter' + item[0]}
          renderItem={({ item }) => (
            <FilterItem
              theme={theme}
              filter={item[1]}
              filterKey={item[0]}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default FilterBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingBottom: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  picker: {
    width: 200,
  },
  checkboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
