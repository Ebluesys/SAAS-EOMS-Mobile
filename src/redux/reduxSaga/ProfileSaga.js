import { call, put, select, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getApi,
  patchApi,
  postApi,
  postApiWithParam,
  putApi,
} from '../../utils/helpers/ApiRequest';

import {
  userDetailsSuccess,
  userDetailsFailure,
  clockinSuccess,
  clockinFailure,
  clockoutSuccess,
  clockoutFailure,
  profileUpdateSuccess,
  profileUpdateFailure,
  taskListSuccess,
  taskListFailure,
  complitedTaskListSuccess,
  complitedTaskListFailure,
  addTaskSuccess,
  addTaskFailure,
  applyLeaveSuccess,
  applyLeaveFailure,
  municipalityRegisterSuccess,
  municipalityRegisterFailure,
  municipalityRegisterListFailure,
  municipalityRegisterListSuccess,
  municipalityOfficeListSuccess,
  municipalityOfficeListFailure,
  leaveLogSuccess,
  leaveLogFailure,
  leaveCancelSuccess,
  leaveCancelFailure,
  leaveTypeSuccess,
  leaveTypeFailure,
  taskLocationSuccess,
  taskLocationFailure,
  attendenceStatusFailure,
  attendenceStatusSuccess,
  startTaskSuccess,
  startTaskFailure,
  endTaskSuccess,
  endTaskFailure,
  attendenceReportSuccess,
  attendenceReportFailure,
  taskDoItLaterSuccess,
  taskDoItLaterFailure,
  taskApprovalListFailure,
  taskApprovalListSuccess,
  holidayListFailure,
  holidayListSuccess,
  remainingLeavesFailure,
  remainingLeavesSuccess,
  userActivityFailure,
  userActivitySuccess,
  resetPasswordFailure,
  resetPasswordSuccess,
  updateTaskFailure,
  updateTaskSuccess,
} from '../reducer/ProfileReducer';
import showErrorAlert from '../../utils/helpers/Toast';
import {
  getTokenSuccess,
  logoutRequest,
  logoutSuccess,
} from '../reducer/AuthReducer';
import constants from '../../utils/helpers/constants';
import ShowMessage from '../../utils/helpers/ShowMessage';
let getItem = state => state.AuthReducer;

//User Profile Details

export function* userDetailsSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'auth/getUserProfile', header);

    if (response?.data?.meta?.code == 200) {
      yield put(userDetailsSuccess(response?.data?.data));
    } else {
      yield put(userDetailsFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(userDetailsFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}
export function* attendenceStatusSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
    'device-id': 'v27',
  };
  try {
    let response = yield call(
      getApi,
      `attendance/today-status?date=${action.payload ?? ''}`,
      header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(attendenceStatusSuccess(response?.data?.data));
    } else if (response?.data?.meta?.code == 404) {
      yield put(attendenceStatusSuccess(response?.data?.meta));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(attendenceStatusFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(attendenceStatusFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}

export function* clockinSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'attendance/clock-in',
      action.payload,
      Header,
    );
    if (response?.data?.meta?.code == 200) {
      yield put(clockinSuccess(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'success');
    } else {
      yield put(clockinFailure(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(clockinFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* clockoutSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'attendance/clock-out',
      action.payload,
      Header,
    );
    console.log('response>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(clockoutSuccess(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'success');
    } else {
      yield put(clockoutFailure(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(clockoutFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* profileupdateSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      putApi,
      'auth/updateUserProfile',
      action.payload,
      Header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(profileUpdateSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(profileUpdateFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(profileUpdateFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* taskListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'tasks/get', header);

    if (response?.data?.meta?.code == 200) {
      yield put(taskListSuccess(response?.data?.data));
    } else {
      yield put(taskListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(taskListFailure(error?.response?.data));
  }
}
export function* updateTaskSaga(action) {
  let items = yield select(getItem);
  console.log('action.payload.body>>', action.payload.body);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json', // ← was 'multipart/form-data'
      accesstoken: `Bearer ${items?.getTokenResponse}`, // ← add 'Bearer ' prefix
    };

    const response = yield call(
      postApi,
      `tasks/update-status/${action.payload.taskId}`,
      action.payload.body,
      Header,
    );
    console.log('updateTaskSaga response>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(updateTaskSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(updateTaskFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(updateTaskFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* applyleaveSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };
    const response = yield call(postApi, 'leave/apply', action.payload, Header);
    console.log('applyleaveSaga response>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(applyLeaveSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(applyLeaveFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('applyleaveSaga error>>>>>>>>>', error);

    yield put(applyLeaveFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* leaveTypeListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, `leave-types/active`, header);

    if (response?.data?.meta?.code == 200) {
      yield put(leaveTypeSuccess(response?.data?.data));
    } else {
      yield put(leaveTypeFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(leaveTypeFailure(error?.response?.data));
  }
}

export function* remainingLeaveSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(
      getApi,
      `get_remaining_leavesByAdmin/${action.payload}`,
      header,
    );
    console.log(
      'response>>>>>>>>get_remaining_leavesByAdmin>>>>>>>>',
      response?.data?.meta?.code,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(remainingLeavesSuccess(response?.data?.data));
    } else {
      yield put(remainingLeavesFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(remainingLeavesFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}
export function* leaveLogSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'my-leaves', header);

    if (response?.data?.meta?.code == 200) {
      yield put(leaveLogSuccess(response?.data?.data));
    } else {
      yield put(leaveLogFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(leaveLogFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}
export function* cancelLeaveSaga(action) {
  const items = yield select(getItem);

  try {
    const Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      putApi,
      `leave-cancel/${action.payload}`,
      {},
      Header,
    );

    if (response?.data?.meta?.code === 200) {
      yield put(leaveCancelSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(leaveCancelFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('Cancel Leave Error:', error?.response || error);

    yield put(
      leaveCancelFailure(
        error?.response?.data || { message: error.message },
      ),
    );

    showErrorAlert(
      error?.response?.data?.meta?.message ||
      error?.message ||
      'Something went wrong',
    );
  }
}
export function* attendenceReportSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
    'device-id': 'v27',
  };
  try {
    let response = yield call(getApi, 'attendance/summary', header);

    if (response?.data?.meta?.code == 200) {
      yield put(attendenceReportSuccess(response?.data?.data));
    } else if (response?.data?.meta?.code == 404) {
      yield put(attendenceReportSuccess(response?.data?.meta));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(attendenceReportFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(attendenceReportFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}

export function* holidayListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, `holidays`, header);

    if (response?.data?.meta?.code == 200) {
      yield put(holidayListSuccess(response?.data?.data));
    } else {
      yield put(holidayListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(holidayListFailure(error?.response?.data));
  }
}

export function* userActivitySaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(
      getApi,
      `user-activity?date=${action.payload}`,
      header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(userActivitySuccess(response?.data?.data));
    } else {
      yield put(userActivityFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(userActivityFailure(error?.response?.data));
  }
}

export function* resetPasswordSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'employee-reset-password',
      action.payload,
      Header,
    );
    if (response?.data?.meta?.code == 200) {
      yield put(resetPasswordSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(resetPasswordFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(resetPasswordFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
const watchFunction = [
  (function* () {
    yield takeLatest('Profile/userDetailsRequest', userDetailsSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/attendenceStatusRequest', attendenceStatusSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/clockinRequest', clockinSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/clockoutRequest', clockoutSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/profileUpdateRequest', profileupdateSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/taskListRequest', taskListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/updateTaskRequest', updateTaskSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/applyLeaveRequest', applyleaveSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/leaveLogRequest', leaveLogSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/leaveCancelRequest', cancelLeaveSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/leaveTypeRequest', leaveTypeListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/remainingLeavesRequest', remainingLeaveSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/attendenceReportRequest', attendenceReportSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/holidayListRequest', holidayListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/userActivityRequest', userActivitySaga);
  })(),
  (function* () {
    yield takeLatest('Profile/resetPasswordRequest', resetPasswordSaga);
  })(),
];

export default watchFunction;
