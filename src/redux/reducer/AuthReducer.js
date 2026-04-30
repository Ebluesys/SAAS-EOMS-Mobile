import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: '',
  isLoading: true,
  getTokenResponse: null,
  error: {},
  logoutResponse: {},
  signinResponse: {},
};

const AuthSlice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {
    //TOKEN
   getTokenRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    getTokenSuccess(state, action) {
      state.isLoading = false;
      state.getTokenResponse = action.payload;
      state.status = action.type;
    },
    getTokenFailure(state, action) {
      state.isLoading = false;
      state.error = action.error;
      state.status = action.type;
    },

        //logout
    logoutRequest(state, action) {
      state.status = action.type;
    },
    logoutSuccess(state, action) {
      state.logoutResponse = action.payload;
      state.status = action.type;
    },
    logoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    //SIGN IN
    signInRequest(state, action) {
      state.status = action.type;
    },
    signInSuccess(state, action) {
      state.signinResponse = action.payload;
      state.status = action.type;
    },
    signInFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
  },
});

export const {
  logoutRequest,
  logoutSuccess,
  logoutFailure,

  getTokenRequest,
  getTokenSuccess,
  getTokenFailure,

  signInRequest,
  signInSuccess,
  signInFailure,
} = AuthSlice.actions;

export default AuthSlice.reducer;
