import React from 'react';
import {
  Text,
  Image,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/tabScreens/Home';
import MyProfile from '../screens/tabScreens/MyProfile';
import { Colors, Images } from '../themes/ThemePath';
import normalize from '../utils/helpers/normalize';
import ActiveTask from '../screens/tabScreens/ActiveTask';
import Leave from '../screens/tabScreens/Leave';
import AttendenceReport from '../screens/tabScreens/AttendenceReport';
import Svg, { Path } from 'react-native-svg';

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, source }) => (
  <View style={[styles.tabIconContainer, focused && styles.focusedTabIcon]}>
    <Image
      style={[styles.tabIcon, focused && styles.focusedIcon]}
      source={source}
      resizeMode="contain"
    />
  </View>
);

const BottomTabNav = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        unmountOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <Svg
              width="100%"
              height="100%"
              style={styles.svgCurve}
              viewBox="0 0 400 85"
              preserveAspectRatio="none"
            >
              <Path
                d="M0,20 Q0,0 20,0 L130,0 Q150,0 160,18 C170,28 180,35 200,35 C220,35 230,28 240,18 Q250,0 270,0 L380,0 Q400,0 400,20 L400,85 L0,85 Z"
                fill={Colors.skyblue}
              />
            </Svg>
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="AttendenceReport"
        component={AttendenceReport}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
        })}
        options={{
          unmountOnBlur: true,
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
          tabBarIcon: ({ focused }) => (
            <View style={styles.floatingButtonWrapper}>
              <View style={styles.floatingButton}>
                <View style={styles.floatingButtonInner}>
                  <Image
                    style={{
                      height: normalize(30),
                      width: normalize(30),
                      tintColor:focused ? Colors.red :Colors.white,
                    }}
                    source={Images.tab1}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ActiveTask"
        component={ActiveTask}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={Images.tab3} />
          ),
        }}
      />

      <Tab.Screen
        name="MyProfile"
        component={MyProfile}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
        })}
        options={{
          unmountOnBlur: true,
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
    borderTopColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopRightRadius: normalize(20),
    borderTopLeftRadius: normalize(20),
    height: normalize(85),
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopRightRadius: normalize(20),
    borderTopLeftRadius: normalize(20),
  },
  svgCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: Platform.OS === 'ios' ? normalize(5) : normalize(10),
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(15),
    borderRadius: normalize(50),
  },
  focusedTabIcon: {
    backgroundColor: 'rgb(239, 250, 254)',
  },
  tabIcon: {
    height: normalize(20),
    width: normalize(20),
    tintColor: Colors.white,
  },
  focusedIcon: {
    tintColor: Colors.red,
  },
  floatingButtonWrapper: {
    top: normalize(-25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    backgroundColor: Colors.skyblue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.white,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: normalize(2),
    borderColor: Colors.white,
  },
  floatingButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(35),
  },
});
