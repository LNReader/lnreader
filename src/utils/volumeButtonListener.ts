import { NativeModules } from 'react-native';
interface VolumeButtonInterface {
  connect(): void;
  disconnect(): void;
  preventDefault(): void;
  noPreventDefault(): void;
  pause(): void;
  unpause(): void;
}
const { VolumeButtonListener } = NativeModules;
export default VolumeButtonListener as VolumeButtonInterface;
