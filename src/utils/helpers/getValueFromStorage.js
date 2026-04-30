import React, { useState, useEffect } from 'react';
import AsyncStorage  from '@react-native-async-storage/async-storage'; // corrected import
import constants from './constants';
import { useTranslation } from 'react-i18next';

export async function getValueFromStorage(prop) {
  const {t, i18n} = useTranslation();
    try {
      const value = await AsyncStorage.getItem(constants.LANGUAGE);
      console.log(value,'valuevaluevalue')
      // let selectedLan = value !== null ? value : 'en' ? 'en-US' : 'ar';
      
      // i18n.changeLanguage(selectedLan);
      return value !== null ? value : 'en';

    } catch (error) {
      console.log('Error retrieving value from AsyncStorage:', error);
      return 'en';
    }
  }


// import {PixelRatio, Platform, Dimensions} from 'react-native';

// const scale = Platform.OS=='ios' ? Dimensions.get('window').width /  320 :Dimensions.get('window').width /  320;

// export default normalize = size => {
//   const newSize = size * scale;

//   return Math.round(PixelRatio.roundToNearestPixel(newSize));
// };