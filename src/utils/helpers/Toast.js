import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useSelector} from 'react-redux';

function showErrorAlert(message) {
  if (Platform.OS == 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Toast.show(message, Toast.LONG);
  }
}
export default showErrorAlert;
