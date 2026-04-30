import {
  Alert,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import Loader from '../../utils/helpers/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

let status = '';

const InformalHome = props => {
  const dispatch = useDispatch();

  const isFocused = useIsFocused();
  const [loadingMessage, setLoadingMessage] = useState('');

  // Permission states
  const [locationPermission, setLocationPermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  // Sample worker data - replace with your actual data
  const [workersData, setWorkersData] = useState([
    { id: '1', name: 'Shouvik Patra', status: 'clocked-out' },
    { id: '2', name: 'Koushik Pal', status: 'clocked-in' },
    { id: '3', name: 'Ranjan Majhi', status: 'clocked-out' },
    { id: '4', name: 'Suman Pramanik', status: 'absent' },
    { id: '5', name: 'Soumi Ghosh Dostidar', status: 'clocked-in' },
  ]);

  useEffect(() => {
    checkLocationPermission();
    checkCameraPermission();
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();

      if (status !== 'authorized') {
        const newStatus = await Camera.requestCameraPermission();
      }
    };

    checkPermission();
  }, [isFocused]);

  useEffect(() => {}, [isFocused]);

  // Check and request location permission
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted) {
          setLocationPermission('granted');
          return true;
        } else {
          const requestResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission Required',
              message:
                'This app needs access to your location for attendance marking.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermission('granted');
            return true;
          } else if (
            requestResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ) {
            setLocationPermission('denied');
            showSettingsAlert('Location');
            return false;
          } else {
            setLocationPermission('denied');
            return false;
          }
        }
      } catch (error) {
        console.log('Location permission error:', error);
        setLocationPermission('denied');
        return false;
      }
    } else {
      // For iOS, you might need to check differently
      setLocationPermission('granted');
      return true;
    }
  };

  // Check and request camera permission
  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.getCameraPermissionStatus();

      if (permission === 'granted') {
        setCameraPermission('granted');
        return true;
      } else if (permission === 'not-determined') {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission === 'granted') {
          setCameraPermission('granted');
          return true;
        } else {
          setCameraPermission('denied');
          if (newPermission === 'denied') {
            showSettingsAlert('Camera');
          }
          return false;
        }
      } else {
        setCameraPermission('denied');
        showSettingsAlert('Camera');
        return false;
      }
    } catch (error) {
      console.log('Camera permission error:', error);
      setCameraPermission('denied');
      return false;
    }
  };

  // Show alert to navigate to settings
  const showSettingsAlert = permissionType => {
    Alert.alert(
      `${permissionType} Permission Required`,
      `Please enable ${permissionType.toLowerCase()} permission in settings to use this feature.`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  };

  // Handle clock in/out functionality
  const handleClockInOut = (workerId) => {
    setWorkersData(prevData =>
      prevData.map(worker =>
        worker.id === workerId
          ? {
              ...worker,
              status: worker.status === 'clocked-in' ? 'clocked-out' : 'clocked-in'
            }
          : worker
      )
    );
  };

  // Handle absent functionality
  const handleAbsent = (workerId) => {
    setWorkersData(prevData =>
      prevData.map(worker =>
        worker.id === workerId
          ? { ...worker, status: 'absent' }
          : worker
      )
    );
  };

  // Render worker item
  const renderWorkerItem = ({ item }) => (
    <View style={styles.workerItem}>
      <Text style={styles.workerName}>{item.name}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.clockButton,
            item.status === 'clocked-in' ? styles.clockOutButton : styles.clockInButton
          ]}
          onPress={() => handleClockInOut(item.id)}
          disabled={item.status === 'absent'}
        >
          <Text style={styles.buttonText}>
            {item.status === 'clocked-in' ? 'Clock-Out' : 'Clock-In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.absentButton,
            item.status === 'absent' && styles.absentActiveButton
          ]}
          onPress={() => handleAbsent(item.id)}
        >
          <Text style={[
            styles.buttonText,
            item.status === 'absent' && styles.absentActiveText
          ]}>
            Absent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={Images.greenbg} style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendance'}
        onPress_back_button={() => {
          // setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />

      <Loader visible={false} loadingText={loadingMessage || 'Loading...'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>Baidyabati Children Park</Text>

            <Text
              style={[
                styles.userAddress,
                { color: Colors.orange, textTransform: 'capitalize' },
              ]}
            >
              Baidyabati
            </Text>

            <Text style={styles.whiteText}>
              Today :
              <Text style={styles.todayText}>
                {' '}
                {moment().format('ddd, MMM, D')}.
              </Text>
            </Text>

            {/* Permission Status Indicators */}
            {(locationPermission === 'denied' ||
              cameraPermission === 'denied') && (
              <View style={styles.permissionWarning}>
                <Text style={styles.permissionWarningText}>
                  ⚠️ Permissions needed for attendance marking
                </Text>
                {locationPermission === 'denied' && (
                  <Text style={styles.permissionText}>
                    • Location access required
                  </Text>
                )}
                {cameraPermission === 'denied' && (
                  <Text style={styles.permissionText}>
                    • Camera access required
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Workers List Section */}
        <View style={styles.workersListContainer}>
          <Text style={styles.workersListHeading}>List of Workers</Text>
          
          <FlatList
            data={workersData}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkerItem}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scrolling since we're inside ScrollView
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default InformalHome;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  userInfoContainer: {
    alignSelf: "center",
    width: '95%',
    padding: normalize(10),
    backgroundColor: Colors.bgColor,
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    marginTop: normalize(10),
  },
  userTextContainer: {
    width: '60%',
  },
  userName: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 20,
    color: Colors.white
  },
  phone: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
  },
  userAddress: {
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    marginTop: 5,
  },
  whiteText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.white,
  },
  blackText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.black,
  },
  redText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.red,
  },
  todayText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.green,
  },

  // New styles for permission warnings
  permissionWarning: {
    marginTop: normalize(10),
    padding: normalize(8),
    backgroundColor: '#FFF3CD',
    borderRadius: normalize(5),
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
  },
  permissionWarningText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  permissionText: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 12,
    color: '#856404',
    marginLeft: 10,
  },

  // Workers List Styles
  workersListContainer: {
    alignSelf: "center",
    width: '95%',
    backgroundColor: Colors.bgColor,
    borderRadius: normalize(8),
    padding: normalize(10),
    marginBottom: normalize(20),
  },
  workersListHeading: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 18,
    color: Colors.white,
    marginBottom: normalize(15),
    textAlign: 'center',
  },
  flatListContainer: {
    paddingBottom: normalize(10),
  },
  workerItem: {
    width:'100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    backgroundColor: '#F8F9FA',
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  workerName: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    color: Colors.black,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  clockButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    minWidth: normalize(80),
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: Colors.green || '#28A745',
  },
  clockOutButton: {
    backgroundColor: '#FFC107',
  },
  absentButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    minWidth: normalize(70),
    alignItems: 'center',
    backgroundColor: '#6C757D',
  },
  absentActiveButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  absentActiveText: {
    color: Colors.white,
  },
});