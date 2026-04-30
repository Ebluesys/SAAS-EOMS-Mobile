import { call, put, takeLatest } from 'redux-saga/effects';
import showErrorAlert from '../../utils/helpers/Toast';
import { postApi } from '../../utils/helpers/ApiRequest';
import {
  getTokenFailure,
  getTokenSuccess,
  logoutFailure,
  logoutSuccess,
  signInFailure,
  signInSuccess,
} from '../reducer/AuthReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '../../utils/helpers/constants';
import ShowMessage from '../../utils/helpers/ShowMessage';
export function* getTokenSaga() {
  try {
    const response = yield call(AsyncStorage.getItem, constants.TOKEN);
    if (response != null) {
      yield put(getTokenSuccess(response));
      console.log('TOKEN===--->', response);
    } else {
      yield put(getTokenSuccess(null));
    }
  } catch (error) {
    yield put(getTokenFailure(error));
  }
}

export function* signinSaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  try {
    let response = yield call(
      postApi,
      'loginForApp',
      action.payload,
      header,
    );
    console.log('LOGIN_response>>>', response);
    // if (response?.data?.meta?.code == 200) {
    //   yield put(signInSuccess(response?.data?.data));
    //   ShowMessage(response?.data?.meta?.message, 'success');

    //   yield call(
    //     AsyncStorage.setItem,
    //     constants.TOKEN,
    //     response?.data?.data?.token,
    //   );
    //   yield put(getTokenSuccess(response?.data?.data?.token));
    // } else {
    //   yield put(signInFailure(response?.data?.data));
    //   ShowMessage(response?.data?.meta?.message, 'error');
    // }
  } catch (error) {
    yield put(signInFailure(error));
  }
}

/* LOGOUT */
export function* userLogoutSaga() {
  try {
    yield call(AsyncStorage.removeItem, constants.TOKEN);
    yield put(getTokenSuccess(null));
    yield put(logoutSuccess());
  } catch (error) {
    yield put(logoutFailure());
  }
}
const watchFunction = [
  (function* () {
    yield takeLatest('Auth/getTokenRequest', getTokenSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/logoutRequest', userLogoutSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/signInRequest', signinSaga);
  })(),
];
export default watchFunction;
