import {all} from 'redux-saga/effects';
import AuthSaga from './AuthSaga';
import ProfileSaga from './ProfileSaga'

const combinedSaga = [
  ...AuthSaga,...ProfileSaga
];

export default function* RootSaga() {
  yield all(combinedSaga);
}