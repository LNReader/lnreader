interface FilterValue {
  label: string;
  value: string;
}

export enum FilterInputs {
  TextInput,
  Picker,
  Checkbox,
}

export interface SourceFilter {
  key: string;
  label: string;
  values: FilterValue[];
  inputType: FilterInputs;
}

export type SelectedFilter = Record<string, string | string[]>;
