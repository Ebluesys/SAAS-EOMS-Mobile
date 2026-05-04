import { call, put, select, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getApi,
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
    let response = yield call(getApi, `attendance/today-status?date=${action.payload ?? ''}`, header);

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

    const response = yield call(postApi, 'attendance/clock-in', action.payload, Header);
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

    const response = yield call(postApi, 'attendance/clock-out', action.payload, Header);
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
    let response = yield call(getApi, 'get-all-tasks', header);

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
export function* complitedTaskListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(
      getApi,
      `get-task-submit?status=${action.payload}`,
      header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(complitedTaskListSuccess(response?.data?.data));
    } else {
      yield put(complitedTaskListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(complitedTaskListFailure(error?.response?.data));
  }
}

export function* taskApprovalListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(
      getApi,
      'get-task-submit-rejected-or-pending',
      header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(taskApprovalListSuccess(response?.data?.data));
    } else {
      yield put(taskApprovalListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(taskApprovalListFailure(error?.response?.data));
  }
}
export function* addTaskSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'create-task-submit',
      action.payload,
      Header,
    );
    console.log('addTaskSaga:::response>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(addTaskSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
      // ShowMessage(response?.data?.meta?.message, 'success');
    } else {
      yield put(addTaskFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
      // ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(addTaskFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* applyleaveSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(postApi, 'leave/apply', action.payload, Header);

    if (response?.data?.meta?.code == 200) {
      yield put(applyLeaveSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(applyLeaveFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(applyLeaveFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* municipalityRegisterSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'createMunicipality',
      action.payload,
      Header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(municipalityRegisterSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(municipalityRegisterFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(municipalityRegisterFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* municipalityRegisterListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'getMunicipalityList', header);

    if (response?.data?.meta?.code == 200) {
      yield put(municipalityRegisterListSuccess(response?.data?.data));
    } else {
      yield put(municipalityRegisterListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(municipalityRegisterListFailure(error?.response?.data));
  }
}

export function* municipalityOfficeListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(
      getApi,
      `getOfficeByMunicipalityName/${action.payload}`,
      header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(municipalityOfficeListSuccess(response?.data?.data));
    } else {
      yield put(municipalityOfficeListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(municipalityOfficeListFailure(error?.response?.data));
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
    let response = yield call(
      getApi,
      `leave-types/active`,
      header,
    );

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
    let response = yield call(getApi, 'leave_status', header);

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
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApiWithParam,
      `leave-cancel/${action.payload}`,
      action.payload,
      Header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(leaveCancelSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(leaveCancelFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(leaveCancelFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* taskLocationSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'get-all-locations', header);

    if (response?.data?.meta?.code == 200) {
      yield put(taskLocationSuccess(response?.data?.data));
    } else {
      yield put(taskLocationFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(taskLocationFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}

export function* startTaskSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(postApi, 'start-task', action.payload, Header);
    console.log('start-task>>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(startTaskSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(startTaskFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(startTaskFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* endTaskSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(postApi, 'end-task', action.payload, Header);
    if (response?.data?.meta?.code == 200) {
      yield put(endTaskSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(endTaskFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(endTaskFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
// export function* attendenceReportSaga(action) {
//   let items = yield select(getItem);

//   try {
//     let Header = {
//       Accept: 'application/json',
//       contenttype: 'application/json',
//       accesstoken: items?.getTokenResponse,
//       'device-id': 'v27',
//     };

//     const response = yield call(
//       postApi,
//       'attendance/summary/',
//       action.payload,
//       Header,
//     );
//     if (response?.data?.meta?.code == 200) {
//       yield put(attendenceReportSuccess(response?.data?.data));
//       showErrorAlert(response?.data?.meta?.message);
//     } else {
//       yield put(attendenceReportFailure(response?.data?.data));
//       showErrorAlert(response?.data?.meta?.message);
//     }
//   } catch (error) {
//     yield put(attendenceReportFailure(error?.response?.data));
//     // showErrorAlert(error?.response?.data?.meta?.message);
//   }
// }


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

export function* taskDoItLaterSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'doitLater-task-tracking',
      action.payload,
      Header,
    );
    if (response?.data?.meta?.code == 200) {
      yield put(taskDoItLaterSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(taskDoItLaterFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(taskDoItLaterFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
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
    let response = yield call(
      getApi,
      `holidays`,
      header,
    );

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
// export function* userActivitySaga(action) {
//   let items = yield select(getItem);

//   try {
//     let Header = {
//       Accept: 'application/json',
//       contenttype: 'application/json',
//       accesstoken: items?.getTokenResponse,
//     };

//     const response = yield call(postApi, `user-activity?date=${action.payload}`,  Header);
//     if (response?.data?.meta?.code == 200) {
//       yield put(userActivitySuccess(response?.data?.data));
//       showErrorAlert(response?.data?.meta?.message);
//     } else {
//       yield put(userActivityFailure(response?.data?.data));
//       showErrorAlert(response?.data?.meta?.message);
//     }
//   } catch (error) {
//     console.log('helooo>>>', error);
//     yield put(userActivityFailure(error?.response?.data));
//     // showErrorAlert(error?.response?.data?.meta?.message);
//   }
// }

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
    yield takeLatest('Profile/complitedTaskListRequest', complitedTaskListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/taskApprovalListRequest', taskApprovalListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/addTaskRequest', addTaskSaga);
  })(),
  (function* () {
    yield takeLatest(
      'Profile/municipalityRegisterRequest',
      municipalityRegisterSaga,
    );
  })(),
  (function* () {
    yield takeLatest('Profile/applyLeaveRequest', applyleaveSaga);
  })(),
  (function* () {
    yield takeLatest(
      'Profile/municipalityRegisterListRequest',
      municipalityRegisterListSaga,
    );
  })(),
  (function* () {
    yield takeLatest(
      'Profile/municipalityOfficeListRequest',
      municipalityOfficeListSaga,
    );
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
    yield takeLatest('Profile/taskLocationRequest', taskLocationSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/startTaskRequest', startTaskSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/endTaskRequest', endTaskSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/attendenceReportRequest', attendenceReportSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/taskDoItLaterRequest', taskDoItLaterSaga);
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
