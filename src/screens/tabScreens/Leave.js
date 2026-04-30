import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Header from '../../components/Header';
import ApplyLeave from './ApplyLeave';
import Leavelog from './Leavelog';
import { useSelector } from 'react-redux';
import { Colors, Fonts } from '../../themes/ThemePath';

const Tab = createMaterialTopTabNavigator();

const LeaveTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: Fonts.MulishBold,
          color: Colors.white,
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors.white,
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: Colors.orange,
        },
      }}
    >
      <Tab.Screen name="Leave Apply" component={ApplyLeave} />
      <Tab.Screen name="Leave Details" component={Leavelog} />
    </Tab.Navigator>
  );
};

const Leave = ({ navigation }) => {
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Leave'}
        onPress_back_button={() => navigation.goBack()}
        onPress_right_button={() => navigation.navigate('Notification')}
      />
      <LeaveTabs />
    </View>
  );
};

export default Leave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
  },
});
