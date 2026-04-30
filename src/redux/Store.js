import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {logger} from 'redux-logger';
import AuthReducer from './reducer/AuthReducer';
import RootSaga from './reduxSaga/RootSaga';
import ProfileReducer from './reducer/ProfileReducer';
let SagaMiddleware = createSagaMiddleware();

export default configureStore({
  reducer: {
    AuthReducer: AuthReducer,
    ProfileReducer:ProfileReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(SagaMiddleware, logger),
});

SagaMiddleware.run(RootSaga);