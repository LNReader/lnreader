import {
  FilterToValues,
  FilterTypes,
  Filters,
  isCheckboxValue,
  isPickerValue,
  isSwitchValue,
  isTextValue,
  ValueOfFilter,
  isXCheckboxValue,
} from '@plugins/types/filterTypes';

export const getValueFor = <T extends FilterTypes>(
  filter: Filters[string],
  value: FilterToValues<Filters>[string],
): ValueOfFilter<T> => {
  switch (filter.type) {
    case FilterTypes.CheckboxGroup:
      return (
        isCheckboxValue(value) ? value.value : filter.value
      ) as ValueOfFilter<T>;
    case FilterTypes.Picker:
      return (
        isPickerValue(value) ? (value.value as ValueOfFilter<T>) : filter.value
      ) as ValueOfFilter<T>;
    case FilterTypes.Switch:
      return (
        isSwitchValue(value) ? value.value : filter.value
      ) as ValueOfFilter<T>;
    case FilterTypes.TextInput:
      return (
        isTextValue(value) ? value.value : filter.value
      ) as ValueOfFilter<T>;
    case FilterTypes.ExcludableCheckboxGroup:
      return (
        isXCheckboxValue(value) ? value.value : filter.value
      ) as ValueOfFilter<T>;
    default:
      throw 'Invalid filter type!';
  }
};
