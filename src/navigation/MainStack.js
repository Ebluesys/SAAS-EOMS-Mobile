import React, { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Toast from 'react-native-toast-message';

import { useSelector } from 'react-redux';
import Splash from '../screens/splash/Splash';
import BottomTabNav from './BottomTabNav';
import Signin from '../screens/authScreens/Signin';
import Attendence from '../screens/tabScreens/Attendance';
import { useAppTheme } from '../themes/ThemeContext';
const Stack = createStackNavigator();
export default function StackNav() {
  const AuthReducer = useSelector(state => state.AuthReducer);
  const { isDarkMode, colors } = useAppTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.page,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.skyblue,
        notification: colors.red,
      },
    };
  }, [colors, isDarkMode]);

  const authScreens = {
    Signin: Signin,
  };
  const mainScreens = {
    BottomTabNav: BottomTabNav,
    Attendence:Attendence
  };
  if (AuthReducer?.isLoading) {
    return <Splash />;
  } else {
    return (
      <NavigationContainer theme={navigationTheme}>
        {AuthReducer.getTokenResponse === null ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {Object.entries({
              ...authScreens,
            }).map(([name, component]) => {
              return <Stack.Screen name={name} component={component} />;
            })}
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {Object.entries({
              ...mainScreens,
            }).map(([name, component]) => {
              return <Stack.Screen name={name} component={component} />;
            })}
          </Stack.Navigator>
        )}
        <Toast />
      </NavigationContainer>
    );
  }
}
