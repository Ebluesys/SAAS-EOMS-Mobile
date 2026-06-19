import { StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import MainStack from './src/navigation/MainStack';
import { useDispatch } from 'react-redux';
import { getTokenRequest } from './src/redux/reducer/AuthReducer';
import {
  CustomAlertProvider,
  useCustomAlert,
} from './src/utils/helpers/CustomAlertContext';
import { setAlertInstance } from './src/utils/helpers/ShowMessage';
import { ThemeProvider, useAppTheme } from './src/themes/ThemeContext';

const AppContent = () => {
  const dispatch = useDispatch();
  const { isDarkMode, colors } = useAppTheme();

  useEffect(() => {
    dispatch(getTokenRequest());
  }, [dispatch]);

  const InitAlert = () => {
    const alert = useCustomAlert();

    useEffect(() => {
      setAlertInstance(alert);
    }, [alert]);

    return null;
  };

  return (
    <CustomAlertProvider>
      <InitAlert />
      <StatusBar
        animated={true}
        backgroundColor={colors.page}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <MainStack />
    </CustomAlertProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});