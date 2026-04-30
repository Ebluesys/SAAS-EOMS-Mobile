import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import Button from '../../components/Button';
import TextInputWithButton from '../../components/TextInputWithBotton';
import Loader from '../../utils/helpers/Loader';
import showErrorAlert from '../../utils/helpers/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { signInRequest } from '../../redux/reducer/AuthReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import ShowMessage from '../../utils/helpers/ShowMessage';
import constants from '../../utils/helpers/constants';
import UpdateModal from '../../components/UpdateModal';
import { Camera } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
const windowHeight = Dimensions.get('window').height;
let status = '';
const Signin = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const AuthReducer = useSelector(state => state.AuthReducer);


  const [phone, setPhone] = useState('9876543210'); 
  const [secure1, setSecure1] = useState(true);
  const [password, setPassword] = useState('123456'); //
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log('loading>>>>>>', loading);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app requires access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS case
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  useEffect(() => {
    requestLocationPermission();
  }, []);
  const employeeLogin = () => {
    setLoading(true);
    if (phone === '') {
      showErrorAlert('Please Enter username');
    } else if (password == '') {
      showErrorAlert('Please Enter Password');
    } else {
      let obj = {
        phone: phone.trim(),
        password: password,
      };
      connectionrequest()
        .then(() => {
          dispatch(signInRequest(obj));
        })
        .catch(err => {
          showErrorAlert('Please connect to internet');
        });
    }
  };
  if (status == '' || AuthReducer.status != status) {
    switch (AuthReducer.status) {
      case 'Auth/signInRequest':
        status = AuthReducer.status;
        break;
      case 'Auth/signInSuccess':
        status = AuthReducer.status;
        setLoading(false);

        break;
      case 'Auth/signInFailure':
        status = AuthReducer.status;
        setLoading(false);
        break;
    }
  }
  return (
    <ImageBackground
      source={Images.pageBackground}
      resizeMode="cover"
      style={styles.onbordingStyle}
    >
      <Loader visible={AuthReducer?.status == 'Auth/signInRequest'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
       
          contentContainerStyle={{
            flexGrow: 1,
            padding: 15,
            paddingBottom: isKeyboardVisible ? normalize(200) : normalize(20),
          }}
        >
          <View style={{ width: '100%', paddingHorizontal: normalize(10) }}>
            <View style={styles.headerContain}>
              <Image
                resizeMode="contain"
                style={{
                  alignSelf: 'center',
                  height: normalize(100),
                  width: normalize(200),
                  marginTop: -30,
                }}
                source={Images.app_logo}
              />

              <Text
                style={[
                  styles.headerText2,
                  { fontSize: 20, fontWeight: 'bold' },
                ]}
              >
                With TECH We MAKE
              </Text>
              <Text style={styles.headerText2}>
               “Please log in to continue”
              </Text>
             
            </View>
          </View>

          <View
            style={{
              width: '100%',
              height: 450,
              alignSelf: 'center',
              backgroundColor: Colors.white,
              borderRadius: normalize(10),
              alignItems: 'center',
              padding: 15,
              marginTop: 15,
            }}
          >
            <Text style={styles.headerText1}>Login</Text>
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'User Name'}
              placeholder={'Enter username'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={phone}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setPhone(e)}
              tintColor={Colors.tintGrey}
            />
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Password'}
              placeholder={'Enter password'}
              keyboardType={'email'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={password}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setPassword(e)}
              isRightIconVisible
              rightimage={Images.eyeclose}
              rightimageheight={normalize(15)}
              rightimagewidth={normalize(15)}
              tintColor={Colors.tintGrey}
              secureTextEntry={secure1}
              onRightPress={() => {
                setSecure1(!secure1);
              }}
            />

            <Button
              height={normalize(45)}
              marginTop={normalize(25)}
              width={'100%'}
              backgroundColor={Colors.skyblue}
              title={'Signin'}
              fontSize={normalize(15)}
              fontFamily={Fonts.MulishSemiBold}
              textColor={'white'}
              onPress={() => {
                employeeLogin();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Signin;

const styles = StyleSheet.create({
  onbordingStyle: {
    flex: 1,
  },

  headerContain: {
    alignSelf: 'flex-start',
    marginTop: normalize(80),

    width: '100%',
  },
  underline: {
    width: normalize(55),
    height: normalize(3),
    borderRadius: normalize(15),
    backgroundColor: Colors.lightYellow,
    marginTop: normalize(5),
  },
  headerText1: {
    // fontFamily: Fonts.MulishRegular,
    fontSize: normalize(22),
    marginTop: normalize(15),
    color: Colors.darkblue,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerText2: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: normalize(12),
    color: Colors.darkblue,

    textAlign: 'center',
  },
  text1: {
    fontSize: normalize(12),
    color: '#B4B3BB',
    fontFamily: Fonts.MulishRegular,
  },
  fontregular: {
    fontSize: normalize(12),
    color: Colors.textInputColor,
    fontFamily: Fonts.MulishRegular,
  },
  contentWrapper: {
    // // height: normalize(370),
    // // position: 'absolute',
    // backgroundColor: Colors.white,
    // borderRadius: normalize(10),
    // width: '100%',
    // bottom: normalize(20),
    // padding: normalize(15)
  },
});
