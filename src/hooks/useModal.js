import {useState} from 'react';

export const useModal = () => {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return {visible, showModal, hideModal};
};
