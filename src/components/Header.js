import React, {useEffect, useState} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import normalize from '../utils/helpers/normalize';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Colors, Fonts, Images} from '../themes/ThemePath';
import constants from '../utils/helpers/constants';
function Header(props) {
  const isFocused = useIsFocused();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setLanguage(props.selectLan);
  }, [props.selectLan]);

  const [selectLanguage, setSelectLanguage] = useState(true);

  function onPress_language_button() {
    if (props.onPress_language_button) {
      languageChanges(selectLanguage);
    }
  }

  function onPress_back_button() {
    if (props.onPress_back_button) {
      props.onPress_back_button();
    }
  }
  function onPress_right_button() {
    if (props.onPress_right_button) {
      props.onPress_right_button();
    }
  }
  const navigation = useNavigation();


  return (
    // <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    <>
      {props?.HeaderLogo ? (
        <View
          style={{
            zIndex:99,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: normalize(15),
            backgroundColor: Colors.skyblue,//'rgb(21,19,38)',
            height: normalize(65),
            paddingTop:10,
            width:'100%',
            // top:0
          }}>
          <TouchableOpacity
            style={{width: normalize(50)}}
            onPress={() =>
              //
              {
                onPress_back_button();
              }
            }>
            {/* <Image
              source={Images.drawerNav}
              style={{height: normalize(22), width: normalize(22)}}
              resizeMode="contain"
            /> */}
          </TouchableOpacity>
          {props?.Title ? (
            <Text
              style={{
                color: Colors.white,
                fontSize: normalize(15),
                fontFamily: Fonts.MulishBold,

                textAlign: 'center',
              }}>
              {props.placeText}
            </Text>
          ) : null}
          {props.midImage ? (
            <Image
              resizeMode="contain"
              source={Images.appName}
              style={{height: normalize(25), width: normalize(70)}}
            />
          ) : null}
          {/* LANGUAGE CHANGE BUTTON */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 90,
            }}>
              <View/>
            {/* <TouchableOpacity
              onPress={() => {
                // onPress_language_button();
                props?.onChangeLanguage(language == 'en' ? 'ar' : 'en');
              }}
              style={{
                // width: normalize(12),

                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: normalize(10),
                paddingVertical: normalize(3),
                backgroundColor: '#15172D', //Colors.lightBlue,
                borderWidth: normalize(0.5),
                borderColor: Colors.button,
                borderRadius: normalize(5),
                marginRight: normalize(5),
                shadowColor: Colors.button,
                shadowOffset: {
                  width: '100%',
                  height: 10,
                },

                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 16,
              }}>
             
            </TouchableOpacity> */}
{/* 
            <TouchableOpacity
              // style={{width: normalize(40)}}
              onPress={() =>
                //
                {
                  onPress_right_button();
                }
              }>
              <Image
                source={Images.notificationBell}
                style={{
                  height: normalize(32),
                  width: normalize(32),
                  alignSelf: 'flex-end',
                }}
              />
            </TouchableOpacity> */}
             <Text
                style={[
                  styles.fontDropdown,
                  {
                    color:Colors.white,
                    fontFamily: Fonts.MulishBold,
                    fontWeight: 'bold',
                    fontSize: normalize(12),
                    textTransform: 'capitalize',
                    // marginRight:normalize(10)
                  },
                ]}>
                v{constants?.APP_VERSION}
              </Text>
          </View>
        </View>
      ) : null}

      {props?.HeaderGoBacklogo ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: normalize(15),
            // backgroundColor: 'rgb(23,29,46)',
            height: normalize(50),
            marginBottom: normalize(5),
          }}>
          <TouchableOpacity
            onPress={() =>
              //
              {
                onPress_back_button();
              }
            }>
            <Image
              resizeMode="contain"
              source={Images.backbutton2}
              style={{height: normalize(30), width: normalize(30)}}
            />
          </TouchableOpacity>
          {props?.Title ? (
            <Text
              style={{
                color: Colors.white,
                fontSize: normalize(15),
                fontFamily: Fonts.MulishBold,
                textAlign: 'center',
              }}>
              {props.placeText}
            </Text>
          ) : null}

          <View style={{height: normalize(30), width: normalize(30)}}></View>
        </View>
      ) : null}
    </>
    // </View>
  );
}

export default Header;
const styles = StyleSheet.create({
  mainContain: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopRightRadius: normalize(20),
    borderTopLeftRadius: normalize(20),
    paddingHorizontal: normalize(10),
    bottom: 0,
    position: 'absolute',
    height: Platform.OS == 'android' ? '88%' : '95%',
    width: '100%',
  },
  cardContain: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: normalize(10),
    padding: normalize(10),
    marginTop: normalize(15),
    shadowColor: Colors.greytext,
    shadowOffset: {
      width: '100%',
      height: 10,
    },

    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  smallbutton: {
    backgroundColor: Colors.lightgreen,
    width: normalize(75),
    height: normalize(30),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(8),
  },
  fontDropdown: {
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(12),
    color: Colors.button,
    // paddingBottom: normalize(5),
  },
  fontLarge: {
    fontFamily: Fonts.MulishBold,
    fontSize: normalize(30),
  },
  fontdesc: {
    fontFamily: Fonts.MulishMedium,
    fontSize: normalize(12),
  },
  fontBold: {
    fontFamily: Fonts.MulishBold,
    fontSize: normalize(12),
    color: Colors.black,
  },
  fontReguler: {
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(12),
    color: Colors.lightgreybg,
  },
  graphContain: {
    borderRadius: normalize(5),
    borderWidth: normalize(1),
    borderColor: Colors.inputGreyBorder,
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(10),
    alignSelf: 'center',
    width: '98%',
    marginBottom: normalize(50),
  },
  edit: {
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(12),
    color: Colors.greytext2,
  },
  delete: {
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(12),
    color: Colors.red,
  },
  deleteView: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(5),
  },
  editView: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(5),
  },
  panelButton: {
    padding: 6,
    alignItems: 'center',
    //marginVertical: 7,
  },
  panelButtonTitle: {
    fontFamily: Fonts.MulishBold,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  btnCameraContainer: {
    width: '100%',
    height: normalize(40),
    borderRadius: normalize(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.button,
  },
  modalCenteredContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    padding: 20,
    backgroundColor: Colors.white,
    paddingTop: 20,
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: normalize(10),
    paddingHorizontal: normalize(15),
    shadowColor: Colors.darkblue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 24,
    height: 35,
    fontFamily: Fonts.MulishSemiBold,
    textAlign: 'center',
    color: Colors.textInputColor,
    textTransform: 'capitalize',
  },
  panelSubtitle: {
    fontSize: 14,
    height: 30,
    marginBottom: normalize(8),
    fontFamily: Fonts.MulishSemiBold,
    textAlign: 'center',
    color: Colors.textInputColor,
    textTransform: 'capitalize',
  },
});
