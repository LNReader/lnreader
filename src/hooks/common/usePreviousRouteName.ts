import { useNavigationState } from '@react-navigation/native';

export const usePreviousRouteName = () => {
  return useNavigationState(state =>
    state.routes[state.index - 1]?.name
      ? state.routes[state.index - 1].name
      : 'None',
  );
};
