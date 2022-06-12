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
  values: FilterValue[];
  inputType: FilterInputs;
}
