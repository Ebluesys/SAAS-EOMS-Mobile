import {useCustomAlert} from './CustomAlertContext';

let alertInstance;

export const setAlertInstance = instance => {
  alertInstance = instance;
};

const ShowMessage = (message, type = 'success') => {
  if (alertInstance) {
    alertInstance.showAlert(message, type);
  } else {
    console.warn('Alert system not initialized');
  }
};

export default ShowMessage;
