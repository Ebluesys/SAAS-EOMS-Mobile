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
  updateTaskResponse: {},
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
  registerFaceResponse: {},
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

    updateTaskRequest(state, action) {
      state.status = action.type;
    },
    updateTaskSuccess(state, action) {
      state.updateTaskResponse = action.payload;
      state.status = action.type;
    },
    updateTaskFailure(state, action) {
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

    registerFaceRequest(state, action) {
      state.status = action.type;
    },
    registerFaceSuccess(state, action) {
      state.registerFaceResponse = action.payload;
      state.status = action.type;
    },
    registerFaceFailure(state, action) {
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

  updateTaskRequest,
  updateTaskSuccess,
  updateTaskFailure,

  addTaskRequest,
  addTaskSuccess,
  addTaskFailure,

  applyLeaveRequest,
  applyLeaveSuccess,
  applyLeaveFailure,

  leaveLogRequest,
  leaveLogSuccess,
  leaveLogFailure,

  leaveCancelRequest,
  leaveCancelSuccess,
  leaveCancelFailure,

  leaveTypeRequest,
  leaveTypeSuccess,
  leaveTypeFailure,

  attendenceReportRequest,
  attendenceReportSuccess,
  attendenceReportFailure,

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

  registerFaceRequest,
  registerFaceSuccess,
  registerFaceFailure,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
