import Geocoder from 'react-native-geocoding';
import constants from '../utils/helpers/constants';

const GOOGLE_API_key = constants.GOOGLE_KEY;

Geocoder.init(GOOGLE_API_key);

const LocationGeocoder = async (latitude, longitude) => {
  try {
    const json = await Geocoder.from(latitude, longitude);
    const address = json.results[0].formatted_address;
    console.log('Address 222:', address);
    return { address, json };
  } catch (error) {
    console.error('Geocoding Error:', error);
    return { address: null, error };
  }
};

export { LocationGeocoder };
