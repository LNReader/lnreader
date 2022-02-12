import {useState} from 'react';

const useModalHook = ({}) => {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return {visible, showModal, hideModal};
};

export default useModalHook;
