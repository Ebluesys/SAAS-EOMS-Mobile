/**
 * @format
 */
import React from 'react';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Store from './src/redux/Store';
import { Provider } from 'react-redux';

LogBox.ignoreAllLogs();

const ebsAttandance=()=>{
    return(
        <Provider store={Store}>
            <App />
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => ebsAttandance);