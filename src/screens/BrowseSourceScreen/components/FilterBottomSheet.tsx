import React, { Suspense, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import BottomSheet from '@components/BottomSheet/BottomSheet';
import {
  BottomSheetFlashList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { useTheme } from '@providers/Providers';
import {
  FilterTypes,
  FilterToValues,
  Filters,
} from '@plugins/types/filterTypes';
import { Button, Menu } from '@components/index';
import { Checkbox } from '@components/Checkbox/Checkbox';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { useBoolean } from '@hooks';
import { TextInput, overlay } from 'react-native-paper';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Switch from '@components/Switch/Switch';

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


const FilterItem: React.FC<FilterItemProps> = React.memo(({
  theme,
  filter,
  filterKey,
  selectedFilters,
  setSelectedFilters,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // All hooks must be called at the top level
  const pickerBoolean = useBoolean();
  const checkboxBoolean = useBoolean();
  const excludableBoolean = useBoolean();

  const inputWidth = { width: screenWidth - 48 };
  const overlayColor = overlay(2, theme.surface);
  const currentValue = selectedFilters[filterKey];

  if (filter.type === FilterTypes.TextInput) {
    const textValue = (currentValue as { value: string } | undefined)?.value || '';
    return (
      <View style={styles.textContainer}>
        <TextInput
          style={[styles.flex, inputWidth]}
          mode="outlined"
          label={
            <Text
              style={[
                styles.label,
                {
                  color: theme.onSurface,
                  backgroundColor: overlayColor,
                },
              ]}
            >
              {` ${filter.label} `}
            </Text>
          }
          defaultValue={textValue}
          theme={{ colors: { background: 'transparent' } }}
          outlineColor={theme.onSurface}
          textColor={theme.onSurface}
          onChangeText={(text: string) =>
            setSelectedFilters(prevState => ({
              ...prevState,
              [filterKey]: { value: text, type: FilterTypes.TextInput },
            }))
          }
        />
      </View>
    );
  }

  if (filter.type === FilterTypes.Picker) {
    const {
      value: isVisible,
      toggle: toggleCard,
      setFalse: closeCard,
    } = pickerBoolean;

    const pickerValue = (currentValue as { value: string } | undefined)?.value;
    const pickerFilter = filter as { options: ReadonlyArray<{ value: string; label: string }> };
    const pickerLabel = pickerValue
      ? pickerFilter.options?.find(option => option.value === pickerValue)?.label || 'Select'
      : 'Select';

    const outlineColor = isVisible ? theme.primary : theme.onSurface;

    const menuItems = pickerFilter.options?.map((val) => (
      <Menu.Item
        key={val.label}
        title={val.label}
        titleStyle={{ color: theme.onSurfaceVariant }}
        onPress={() => {
          closeCard();
          setSelectedFilters(prevFilters => ({
            ...prevFilters,
            [filterKey]: { value: val.value, type: FilterTypes.Picker },
          }));
        }}
      />
    ));

    return (
      <View style={styles.pickerContainer}>
        <Menu
          visible={isVisible}
          contentStyle={{ backgroundColor: theme.surfaceVariant }}
          anchor={
            <Pressable
              style={[styles.flex, inputWidth]}
              onPress={toggleCard}
            >
              <TextInput
                mode="outlined"
                label={
                  <Text
                    style={[
                      styles.label,
                      {
                        color: outlineColor,
                        backgroundColor: overlayColor,
                      },
                    ]}
                  >
                    {` ${filter.label} `}
                  </Text>
                }
                value={pickerLabel}
                editable={false}
                theme={{ colors: { background: 'transparent' } }}
                outlineColor={outlineColor}
                textColor={outlineColor}
              />
            </Pressable>
          }
          onDismiss={closeCard}
        >
          {menuItems}
        </Menu>
      </View>
    );
  }

  if (filter.type === FilterTypes.CheckboxGroup) {
    const {
      value: isVisible,
      toggle: toggleCard,
    } = checkboxBoolean;

    const chevronName = isVisible ? 'chevron-up' : 'chevron-down';
    const checkboxValue = (currentValue as { value: string[] } | undefined)?.value || [];
    const checkboxFilter = filter as { options: ReadonlyArray<{ value: string; label: string }> };

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
            name={chevronName}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible && checkboxFilter.options?.map((val) => (
          <Checkbox
            key={val.label}
            label={val.label}
            theme={theme}
            status={checkboxValue.includes(val.value)}
            onPress={() =>
              setSelectedFilters(prevFilters => ({
                ...prevFilters,
                [filterKey]: {
                  type: FilterTypes.CheckboxGroup,
                  value: insertOrRemoveIntoArray(checkboxValue, val.value),
                },
              }))
            }
          />
        ))}
      </View>
    );
  }

  if (filter.type === FilterTypes.Switch) {
    const switchValue = (currentValue as { value: boolean } | undefined)?.value || false;

    const handlePress = () => {
      setSelectedFilters(prevState => ({
        ...prevState,
        [filterKey]: { value: !switchValue, type: FilterTypes.Switch },
      }));
    };

    return (
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        style={styles.container}
        onPress={handlePress}
      >
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={[{ color: theme.onSurface }, styles.switchLabel]}>
              {filter.label}
            </Text>
          </View>
          <Switch
            value={switchValue}
            onValueChange={handlePress}
          />
        </View>
      </Pressable>
    );
  }

  if (filter.type === FilterTypes.ExcludableCheckboxGroup) {
    const {
      value: isVisible,
      toggle: toggleCard,
    } = excludableBoolean;

    const chevronName = isVisible ? 'chevron-up' : 'chevron-down';
    const excludableValue = (currentValue as { value: { include?: string[]; exclude?: string[] } } | undefined)?.value;
    const include = excludableValue?.include || [];
    const exclude = excludableValue?.exclude || [];
    const excludableFilter = filter as { options: ReadonlyArray<{ value: string; label: string }> };

    const getStatus = (value: string): boolean | 'indeterminate' => {
      if (include.includes(value)) return true;
      if (exclude.includes(value)) return 'indeterminate';
      return false;
    };

    const handlePress = (val: { value: string; label: string }) => {
      if (exclude.includes(val.value)) {
        setSelectedFilters(prev => ({
          ...prev,
          [filterKey]: {
            type: FilterTypes.ExcludableCheckboxGroup,
            value: {
              include: [...include],
              exclude: exclude.filter(f => f !== val.value),
            },
          },
        }));
      } else if (include.includes(val.value)) {
        setSelectedFilters(prev => ({
          ...prev,
          [filterKey]: {
            type: FilterTypes.ExcludableCheckboxGroup,
            value: {
              include: include.filter(f => f !== val.value),
              exclude: [...exclude, val.value],
            },
          },
        }));
      } else {
        setSelectedFilters(prev => ({
          ...prev,
          [filterKey]: {
            type: FilterTypes.ExcludableCheckboxGroup,
            value: {
              include: [...include, val.value],
              exclude: [...exclude],
            },
          },
        }));
      }
    };

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
            name={chevronName}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible && excludableFilter.options?.map((val) => (
          <Checkbox
            key={val.label}
            label={val.label}
            theme={theme}
            status={getStatus(val.value)}
            onPress={() => handlePress(val)}
          />
        ))}
      </View>
    );
  }

  return <></>;
});

interface BottomSheetProps {
  filterSheetRef: React.RefObject<BottomSheetModal | null>;
  filters: Filters;
  setFilters: (filters?: SelectedFilters) => void;
  clearFilters: (filters: Filters) => void;
}

const FilterBottomSheet: React.FC<BottomSheetProps> = React.memo(({
  filters,
  filterSheetRef,
  clearFilters,
  setFilters,
}) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilters>(filters);

  // Memoize expensive calculations
  const backgroundColor = React.useMemo(() => overlay(2, theme.surface), [theme.surface]);
  const containerStyle = React.useMemo(() => [
    styles.container,
    { backgroundColor }
  ], [backgroundColor]);

  // Memoize filter data
  const filterData = React.useMemo(() =>
    filters && Object.entries(filters),
    [filters]
  );

  // Memoize event handlers
  const onReset = React.useCallback(() => {
    setSelectedFilters(filters);
    clearFilters(filters);
  }, [filters, clearFilters]);

  const onFilter = React.useCallback(() => {
    setFilters(selectedFilters);
    filterSheetRef?.current?.close();
  }, [selectedFilters, setFilters, filterSheetRef]);

  return (
    <BottomSheet
      bottomSheetRef={filterSheetRef}
      snapPoints={[400, 600]}
      bottomInset={bottom}
      backgroundStyle={styles.transparent}
      style={containerStyle}
    >
      <BottomSheetView style={{ height: '100%' }}><></>
        <BottomSheetView
          style={[styles.buttonContainer, { borderBottomColor: theme.outline }]}
        >
          <Button
            title={getString('common.reset')}
            onPress={onReset}
          />
          <Button
            title={getString('common.filter')}
            textColor={theme.onPrimary}
            onPress={onFilter}
            mode="contained"
          />
        </BottomSheetView>
        <Suspense fallback={null}>
          <BottomSheetFlashList
            style={{ marginTop: 58, height: '100%' }}
            data={filterData}
            keyExtractor={(item: [string, any]) => 'filter' + item[0]}
            renderItem={({ item }: { item: [string, any] }) => (
              <FilterItem
                theme={theme}
                filter={item[1]}
                filterKey={item[0]}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            )}
          />
        </Suspense>
      </BottomSheetView> 
    </BottomSheet>
  );
});

export default FilterBottomSheet;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  transparent: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    height: 58,

    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  checkboxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  container: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    // flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    paddingHorizontal: 24,
    width: 200,
  },
  pickerContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  switchLabel: {
    fontSize: 16,
  },
  switchLabelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
});
