import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: {},
  isLoading: true,
  error: {},
  userDetailsResponse: {},
  attendenceStatusResponse: {},
  clockinResponse: {},
  clockoutResponse: {},
  profileUpdateResponse: {},
  taskListResponse: {},
  complitedTaskResponse: {},
  addTaskResponse: {},
  applyLeaveResponse: {},
  municipalityRegisterResponse: {},
  municipalityRegisterListResponse: {},
  municipalityOfficeListResponse: {},
  leaveLogResponse: {},
  leaveCancelResponse: {},
  leaveTypeResponse: {},
  taskLocationResponse: {},
  startTaskResponse: {},
  endTaskResponse: {},
  attendenceReportResponse: {},
  taskDoItLaterResponse: {},
  holidayListResponse: {},
  taskApprovalListResponse: {},
  remainingLeavesResponse: {},
  userActivityResponse: {},
  resetPasswordResponse: {},
};

const ProfileSlice = createSlice({
  name: 'Profile',
  initialState,
  reducers: {
    userDetailsRequest(state, action) {
      state.status = action.type;
    },
    userDetailsSuccess(state, action) {
      state.userDetailsResponse = action.payload;
      state.status = action.type;
    },
    userDetailsFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    attendenceStatusRequest(state, action) {
      state.status = action.type;
    },
    attendenceStatusSuccess(state, action) {
      state.attendenceStatusResponse = action.payload;
      state.status = action.type;
    },
    attendenceStatusFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    clockinRequest(state, action) {
      state.status = action.type;
    },
    clockinSuccess(state, action) {
      state.clockinResponse = action.payload;
      state.status = action.type;
    },
    clockinFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    clockoutRequest(state, action) {
      state.status = action.type;
    },
    clockoutSuccess(state, action) {
      state.clockoutResponse = action.payload;
      state.status = action.type;
    },
    clockoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    profileUpdateRequest(state, action) {
      state.status = action.type;
    },
    profileUpdateSuccess(state, action) {
      state.profileUpdateResponse = action.payload;
      state.status = action.type;
    },
    profileUpdateFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    taskListRequest(state, action) {
      state.status = action.type;
    },
    taskListSuccess(state, action) {
      state.taskListResponse = action.payload;
      state.status = action.type;
    },
    taskListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    complitedTaskListRequest(state, action) {
      state.status = action.type;
    },
    complitedTaskListSuccess(state, action) {
      state.complitedTaskResponse = action.payload;
      state.status = action.type;
    },
    complitedTaskListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    taskApprovalListRequest(state, action) {
      state.status = action.type;
    },
    taskApprovalListSuccess(state, action) {
      state.taskApprovalListResponse = action.payload;
      state.status = action.type;
    },
    taskApprovalListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    addTaskRequest(state, action) {
      state.status = action.type;
    },
    addTaskSuccess(state, action) {
      state.addTaskResponse = action.payload;
      state.status = action.type;
    },
    addTaskFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    applyLeaveRequest(state, action) {
      state.status = action.type;
    },
    applyLeaveSuccess(state, action) {
      state.applyLeaveResponse = action.payload;
      state.status = action.type;
    },
    applyLeaveFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    municipalityRegisterRequest(state, action) {
      state.status = action.type;
    },
    municipalityRegisterSuccess(state, action) {
      state.applyLeaveResponse = action.payload;
      state.status = action.type;
    },
    municipalityRegisterFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    municipalityRegisterListRequest(state, action) {
      state.status = action.type;
    },
    municipalityRegisterListSuccess(state, action) {
      state.municipalityRegisterListResponse = action.payload;
      state.status = action.type;
    },
    municipalityRegisterListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    municipalityOfficeListRequest(state, action) {
      state.status = action.type;
    },
    municipalityOfficeListSuccess(state, action) {
      state.municipalityOfficeListResponse = action.payload;
      state.status = action.type;
    },
    municipalityOfficeListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    leaveLogRequest(state, action) {
      state.status = action.type;
    },
    leaveLogSuccess(state, action) {
      state.leaveLogResponse = action.payload;
      state.status = action.type;
    },
    leaveLogFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    leaveCancelRequest(state, action) {
      state.status = action.type;
    },
    leaveCancelSuccess(state, action) {
      state.leaveCancelResponse = action.payload;
      state.status = action.type;
    },
    leaveCancelFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    leaveTypeRequest(state, action) {
      state.status = action.type;
    },
    leaveTypeSuccess(state, action) {
      state.leaveTypeResponse = action.payload;
      state.status = action.type;
    },
    leaveTypeFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    taskLocationRequest(state, action) {
      state.status = action.type;
    },
    taskLocationSuccess(state, action) {
      state.taskLocationResponse = action.payload;
      state.status = action.type;
    },
    taskLocationFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    startTaskRequest(state, action) {
      state.status = action.type;
    },
    startTaskSuccess(state, action) {
      state.startTaskResponse = action.payload;
      state.status = action.type;
    },
    startTaskFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    endTaskRequest(state, action) {
      state.status = action.type;
    },
    endTaskSuccess(state, action) {
      state.endTaskResponse = action.payload;
      state.status = action.type;
    },
    endTaskFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    attendenceReportRequest(state, action) {
      state.status = action.type;
    },
    attendenceReportSuccess(state, action) {
      state.attendenceReportResponse = action.payload;
      state.status = action.type;
    },
    attendenceReportFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    taskDoItLaterRequest(state, action) {
      state.status = action.type;
    },
    taskDoItLaterSuccess(state, action) {
      state.taskDoItLaterResponse = action.payload;
      state.status = action.type;
    },
    taskDoItLaterFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    holidayListRequest(state, action) {
      state.status = action.type;
    },
    holidayListSuccess(state, action) {
      state.holidayListResponse = action.payload;
      state.status = action.type;
    },
    holidayListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    remainingLeavesRequest(state, action) {
      state.status = action.type;
    },
    remainingLeavesSuccess(state, action) {
      state.remainingLeavesResponse = action.payload;
      state.status = action.type;
    },
    remainingLeavesFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    userActivityRequest(state, action) {
      state.status = action.type;
    },
    userActivitySuccess(state, action) {
      state.userActivityResponse = action.payload;
      state.status = action.type;
    },
    userActivityFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    resetPasswordRequest(state, action) {
      state.status = action.type;
    },
    resetPasswordSuccess(state, action) {
      state.resetPasswordResponse = action.payload;
      state.status = action.type;
    },
    resetPasswordFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
  },
});

export const {
  userDetailsRequest,
  userDetailsSuccess,
  userDetailsFailure,

  attendenceStatusRequest,
  attendenceStatusSuccess,
  attendenceStatusFailure,

  clockinRequest,
  clockinSuccess,
  clockinFailure,

  clockoutRequest,
  clockoutSuccess,
  clockoutFailure,

  profileUpdateRequest,
  profileUpdateSuccess,
  profileUpdateFailure,

  taskListRequest,
  taskListSuccess,
  taskListFailure,

  complitedTaskListRequest,
  complitedTaskListSuccess,
  complitedTaskListFailure,

  taskApprovalListRequest,
  taskApprovalListSuccess,
  taskApprovalListFailure,

  addTaskRequest,
  addTaskSuccess,
  addTaskFailure,

  applyLeaveRequest,
  applyLeaveSuccess,
  applyLeaveFailure,

  municipalityRegisterRequest,
  municipalityRegisterSuccess,
  municipalityRegisterFailure,

  municipalityRegisterListRequest,
  municipalityRegisterListSuccess,
  municipalityRegisterListFailure,

  municipalityOfficeListRequest,
  municipalityOfficeListSuccess,
  municipalityOfficeListFailure,

  leaveLogRequest,
  leaveLogSuccess,
  leaveLogFailure,

  leaveCancelRequest,
  leaveCancelSuccess,
  leaveCancelFailure,

  leaveTypeRequest,
  leaveTypeSuccess,
  leaveTypeFailure,

  taskLocationRequest,
  taskLocationSuccess,
  taskLocationFailure,

  startTaskRequest,
  startTaskSuccess,
  startTaskFailure,

  endTaskRequest,
  endTaskSuccess,
  endTaskFailure,

  attendenceReportRequest,
  attendenceReportSuccess,
  attendenceReportFailure,

  taskDoItLaterRequest,
  taskDoItLaterSuccess,
  taskDoItLaterFailure,

  holidayListRequest,
  holidayListSuccess,
  holidayListFailure,

  remainingLeavesRequest,
  remainingLeavesSuccess,
  remainingLeavesFailure,

  userActivityRequest,
  userActivitySuccess,
  userActivityFailure,

  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
