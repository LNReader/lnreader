import { Dispatch, SetStateAction, useCallback, useState } from 'react';

// have no idea about the name
export interface UseBooleanReturnType {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

const useBoolean = (defaultValue?: boolean): UseBooleanReturnType => {
  const [value, setValue] = useState(!!defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(x => !x), []);

  return { value, setValue, setTrue, setFalse, toggle };
};

export default useBoolean;
