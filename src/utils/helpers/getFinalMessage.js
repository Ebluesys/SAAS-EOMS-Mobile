// utils.js
import { select } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import constants from './constants';
import { ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';


async function getFinalMessage(key,AuthReducer) {

  // const AuthReducer = useSelector(state => state.AuthReducer); 
  // const reducerVal = useSelector(state => state.AuthReducer)

  console.log(AuthReducer?.localizationData, ' AuthReducer?.localizationData?.data');
  try {
    const lang = await AsyncStorage.getItem(constants.LANGUAGE); 
    const filterData = AuthReducer?.localizationData?.find(
      item => item.key === key,
    );
    let finalMessage = key;

    if (filterData) {
      finalMessage = lang === 'ar' ? filterData.ar : filterData.en;
    } else {
 
    }
    
    if (Platform.OS == 'android') {
      ToastAndroid.show(finalMessage, ToastAndroid.LONG);
    } else {
      Toast.show(finalMessage, Toast.LONG);
      // ToastAndroid.show(message, ToastAndroid.LONG);
    }
  } catch (error) {
    console.log('Error in getFinalMessage:', error);
    return '';
  }
}

export default getFinalMessage;
