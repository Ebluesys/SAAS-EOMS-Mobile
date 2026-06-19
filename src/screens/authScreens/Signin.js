import {
  Image,
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
import { useAppTheme } from '../../themes/ThemeContext';
let status = '';
const Signin = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const { colors } = useAppTheme();


  const [phone, setPhone] = useState(''); 
  const [secure1, setSecure1] = useState(true);
  const [password, setPassword] = useState(''); //
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.page }] }>
      <View style={styles.backgroundAccentTop} />
      <View style={styles.backgroundAccentBottom} />
      <Loader visible={AuthReducer?.status == 'Auth/signInRequest'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: normalize(20),
            paddingTop: normalize(12),
            paddingBottom: isKeyboardVisible ? normalize(120) : normalize(28),
          }}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Image
                resizeMode="contain"
                style={styles.logo}
                source={Images.app_logo}
              />
            </View>

            <Text style={[styles.heroTitle, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.heroSubtitle, { color: colors.mutedText }] }>
              Sign in to continue to your dashboard and manage your account.
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.headerText1, { color: colors.text }]}>Log in</Text>
            <Text style={[styles.formSubtitle, { color: colors.mutedText }] }>
              Use your username and password to access the app.
            </Text>

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
    </SafeAreaView>
  );
};

export default Signin;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  backgroundAccentTop: {
    position: 'absolute',
    top: -normalize(80),
    right: -normalize(70),
    width: normalize(220),
    height: normalize(220),
    borderRadius: normalize(110),
    backgroundColor: '#DDEBFF',
    opacity: 0.65,
  },
  backgroundAccentBottom: {
    position: 'absolute',
    left: -normalize(100),
    bottom: normalize(90),
    width: normalize(260),
    height: normalize(260),
    borderRadius: normalize(130),
    backgroundColor: '#EAF8F3',
    opacity: 0.9,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: normalize(18),
    paddingBottom: normalize(24),
    width: '100%',
  },
  logoBadge: {
    width: normalize(92),
    height: normalize(92),
    borderRadius: normalize(28),
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(18),
    shadowColor: '#102030',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  logo: {
    width: normalize(62),
    height: normalize(62),
  },
  heroTitle: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: Colors.darkblue,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: normalize(8),
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(13),
    lineHeight: normalize(20),
    color: '#5E6A7D',
    textAlign: 'center',
    maxWidth: '88%',
  },
  formCard: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: normalize(24),
    paddingHorizontal: normalize(18),
    paddingTop: normalize(22),
    paddingBottom: normalize(20),
    shadowColor: '#102030',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(16,32,48,0.05)',
  },
  headerText1: {
    fontSize: normalize(24),
    color: Colors.darkblue,
    fontWeight: '800',
    textAlign: 'center',
  },
  formSubtitle: {
    marginTop: normalize(6),
    marginBottom: normalize(8),
    fontFamily: Fonts.MulishSemiBold,
    fontSize: normalize(12),
    lineHeight: normalize(18),
    color: '#687385',
    textAlign: 'center',
  },
});
