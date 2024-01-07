import FastImage from 'react-native-fast-image';
import { showToast } from '../../utils/showToast';

const clearCoverCache = () => {
  FastImage.clearDiskCache();
  showToast('Cleared cover cache.');
};

export { clearCoverCache };
