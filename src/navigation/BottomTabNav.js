import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/tabScreens/Home';
import MyProfile from '../screens/tabScreens/MyProfile';
import { Colors, Images } from '../themes/ThemePath';
import normalize from '../utils/helpers/normalize';
import ActiveTask from '../screens/tabScreens/ActiveTask';
import Leave from '../screens/tabScreens/Leave';
import AttendenceReport from '../screens/tabScreens/AttendenceReport';
import { useAppTheme } from '../themes/ThemeContext';

const Tab = createBottomTabNavigator();

const TabButton = ({ children, onPress, onLongPress, accessibilityState, routeName }) => {
  const focused = accessibilityState?.selected;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tabButtonWrap,
        focused && styles.tabButtonFocused,
        pressed && styles.tabButtonPressed,
        routeName === 'Home' && styles.centerButtonLift,
        routeName === 'Home' && styles.centerButton,
        routeName === 'Home' && focused && styles.centerButtonFocused,
        routeName === 'Home' && pressed && styles.centerButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
};

const TabIcon = ({ focused, source, isCenterTab }) => (
  <View style={[styles.iconShell, isCenterTab && styles.centerIconShell, focused && styles.iconShellFocused]}>
    <Image
      style={[styles.tabIcon, isCenterTab && styles.centerIcon, focused && styles.focusedIcon]}
      source={source}
      resizeMode="contain"
    />
  </View>
);

const BottomTabNav = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        unmountOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: [
          styles.tabBarStyle,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ],
      }}
    >
      <Tab.Screen
        name="AttendenceReport"
        component={AttendenceReport}
        options={{
          unmountOnBlur: true,
          tabBarButton: props => <TabButton {...props} routeName="AttendenceReport" />,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab6} />
          ),
        }}
      />
      <Tab.Screen
        name="Leave"
        component={Leave}
        options={{
          unmountOnBlur: true,
          tabBarButton: props => <TabButton {...props} routeName="Leave" />,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab2} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          unmountOnBlur: true,
          tabBarButton: props => <TabButton {...props} routeName="Home" />,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab1} isCenterTab />
          ),
        }}
      />

      <Tab.Screen
        name="ActiveTask"
        component={ActiveTask}
        options={{
          unmountOnBlur: true,
          tabBarButton: props => <TabButton {...props} routeName="ActiveTask" />,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab3} />
          ),
        }}
      />

      <Tab.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          unmountOnBlur: true,
          tabBarButton: props => <TabButton {...props} routeName="MyProfile" />,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab4} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNav;

const styles = StyleSheet.create({
  tabBarStyle: {
    borderTopWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: normalize(28),
    height: normalize(78),
    position: 'absolute',
    left: normalize(12),
    right: normalize(12),
    bottom: normalize(10),
    paddingHorizontal: normalize(10),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
    shadowColor: '#0F1B2D',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(6,72,91,0.06)',
  },
  iconShell: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(14),
    backgroundColor: 'rgba(6,72,91,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,72,91,0.04)',
  },
  iconShellFocused: {
    backgroundColor: Colors.skyblue,
    borderColor: Colors.skyblue,
    shadowColor: Colors.skyblue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  tabIcon: {
    height: normalize(20),
    width: normalize(20),
    tintColor: '#748094',
  },
  focusedIcon: {
    tintColor: Colors.white,
  },
  centerIconShell: {
    width: normalize(54),
    height: normalize(54),
    borderRadius: normalize(18),
    backgroundColor: 'rgba(6,72,91,0.08)',
  },
  centerIcon: {
    height: normalize(24),
    width: normalize(24),
  },
  tabButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonFocused: {
    transform: [{ translateY: -4 }],
  },
  tabButtonPressed: {
    transform: [{ translateY: -10 }, { scale: 0.96 }],
  },
  centerButtonLift: {
    top: normalize(-10),
  },
  centerButton: {
    width: normalize(62),
    height: normalize(62),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(6,72,91,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,72,91,0.08)',
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  centerButtonFocused: {
    backgroundColor: 'rgba(6,72,91,0.12)',
    borderColor: 'rgba(6,72,91,0.1)',
  },
  centerButtonPressed: {
    transform: [{ translateY: -4 }, { scale: 0.94 }],
  },
  centerButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(18),
    backgroundColor: Colors.skyblue,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
