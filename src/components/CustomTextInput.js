import React from 'react';
import {View, Image, TextInput, TouchableOpacity, Text} from 'react-native';

import PropTypes from 'prop-types';

import {useState} from 'react';
import normalize from '../utils/helpers/normalize';
import {Colors} from '../themes/ThemePath';

export default function CustomTextInput(props) {
  const [visible, setVisible] = useState(props.isSecure);
  function onChangeText(text) {
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  }

  function onFocus() {
    if (props.onFocus) {
      props.onFocus();
    }
  }

  function onBlur() {
    if (props.onBlur) {
      props.onBlur();
    }
  }
  function onPress() {
    if (props.onPress) {
      props.onPress();
    }
  }
  function onPressssequre() {
    setVisible(!visible);
  }
  function onPressloginButton() {
    if (props.onPressloginButton) {
      props.onPressloginButton();
    }
  }
  return (
    <View
      style={{
        height: normalize(45), //props.heightInput,
        width: props.widthInput,
        borderColor: props.borderColor,
        borderWidth: props.borderWidth,
        borderRadius: props.borderRadius,
        // borderBottomLeftRadius: props.borderRadius,
        // borderTopRightRadius: props.borderRadiusRightRadius,
        // borderBottomRightRadius: props.borderBottomRadiusRightRadius,
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        // position: 'relative',
        backgroundColor: props.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginStart: props.marginStart,
        alignSelf: props.alignSelf,
        alignItems: 'center',
      }}>
      {props.iconleft ? (
        <Image
          source={props.iconleft}
          style={{
            height: props.imgheight,
            width: props.imgwidth,
            position: 'absolute',
            // right: normalize(12),
            // top: normalize(12),
            alignItems: 'center',
            alignSelf: 'center',
            marginStart: 10,
          }}
          resizeMode="contain"
        />
      ) : null}
      <View>
        <Text
          style={{  justifyContent: 'center',
          textAlignVertical: 'center',
          alignItems: 'center',
          alignSelf: 'center',
            marginLeft: props.iconleft == null ? normalize(10) : normalize(30),
          }}>
          {props.HeadingText}
        </Text>
        <TextInput
          style={{
            // paddingLeft: normalize(3),
            // paddingRight: normalize(14),
            marginLeft: props.iconleft == null ? normalize(10) : normalize(30),
            // flex: 1,
            // textAlign: props.textAlign,
            // marginLeft: props.marginLeft,
            letterSpacing: normalize(props.letterSpacing),
            color: props.color,
            fontFamily: props.fontFamily,
            fontSize: normalize(props.fontSize),
            justifyContent: 'center',
            textAlignVertical: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            // position: 'absolute',
            height: props.txtheight,
            marginTop: props.txtmarginTop,
            width: props.txtwidth,
            backgroundColor: 'blue',
            // paddingTop:Platform.OS == 'ios' ? normalize(0) : normalize(8),
          }}
          // caretHidden={props.caretHidden}
          maxLength={props.maxLength}
          secureTextEntry={visible}
          isSecure={props.isSecure}
          multiline={props.multiline}
          autoCapitalize={props.autoCapitalize}
          placeholder={props.placeholder}
          editable={props.editable}
          placeholderTextColor={props.placeholderTextColor}
          keyboardType={props.keyboardType}
          value={props.value}
          fontWeight={props.fontWeight}
          onChangeText={text => {
            onChangeText(text);
          }}
        />
      </View>
      {props.addisSucureBtn ? (
        <TouchableOpacity
          onPress={() => onPressssequre()}
          style={{
            height: normalize(30),
            width: normalize(30),
            // backgroundColor: 'grey',
            borderRadius: normalize(20),
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 3,
            end: 15,
          }}>
          <Image
            source={!visible ? Icons.visible_eye : Icons.hidden_eye}
            style={{
              height: '70%',
              width: '85%',
              alignSelf: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              tintColor: '#AEAEB2',
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : null}
      {/* {props.addloginButton ? (
        <TouchableOpacity
          onPress={() => onPressloginButton()}
          style={{
            height: normalize(30),
            width: normalize(30),
            // backgroundColor: 'grey',
            borderRadius: normalize(20),
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            // top: 3,
            end: 15,
          }}>
          <Image
            source={Icons.login_forword}
            style={{
              height: '70%',
              width: '85%',
              alignSelf: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              // tintColor: '#AEAEB2',
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : null} */}
    </View>
  );
}

CustomTextInput.propTypes = {
  marginTop: PropTypes.number,
  marginBottom: PropTypes.any,
  maxLength: PropTypes.number,
  isSecure: PropTypes.bool,
  multiline: PropTypes.bool,
  autoCapitalize: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  keyboardType: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  color: PropTypes.string,
  letterSpacing: PropTypes.number,
  fontSize: PropTypes.number,
  editable: PropTypes.bool,
  borderColor: PropTypes.string,
  fontWeight: PropTypes.any,
  textAlign: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onPress: PropTypes.func,
  onPressssequre: PropTypes.func,
  onPressloginButton: PropTypes.func,
  caretHidden: PropTypes.bool,
  search: PropTypes.bool,
  borderRadius: PropTypes.any,
  borderRadiusLeftRadius: PropTypes.any,
  borderBottomRadiusRightRadius: PropTypes.any,
  icon: PropTypes.any,
  iconleft: PropTypes.any,
  iconright: PropTypes.any,
  fontFamily: PropTypes.any,
  backgroundColor: PropTypes.any,
  widthInput: PropTypes.any,
  heightInput: PropTypes.any,
  marginStart: PropTypes.any,
  cuppon: PropTypes.any,
  btnWidth: PropTypes.any,
  imgheight: PropTypes.any,
  imgwidth: PropTypes.any,
  imgrightheight: PropTypes.any,
  imgrightwidth: PropTypes.any,
  borderWidth: PropTypes.any,
  txtheight: PropTypes.any,
  txtwidth: PropTypes.any,
  addisSucureBtn: PropTypes.bool,
  addloginButton: PropTypes.bool,
  alignSelf: PropTypes.any,
  marginLeft: PropTypes.any,
  txtmarginTop: PropTypes.any,
};

CustomTextInput.defaultProps = {
  //   backgroundColor: 'red',
  marginTop: 0,
  marginBottom: 0,
  // maxLength: 40,
  isSecure: false,
  multiline: false,
  autoCapitalize: 'none',
  placeholder: '',
  placeholderTextColor: Colors.black,
  keyboardType: 'default',
  value: '',
  onChangeText: null,
  color: Colors.black,
  editable: true,
  borderColor: '#DDDDDD',
  onFocus: null,
  onBlur: null,
  letterSpacing: 0,
  fontSize: 12,
  textAlign: 'left',
  caretHidden: false,
  borderRadius: normalize(10),
  icon: null,
  iconleft: null,
  // fontFamily: Fonts.Poppins_Medium,
  fontWeight: '400',
  backgroundColor: '',
  search: false,
  widthInput: '100%',
  borderRadiusRightRadius: normalize(10),
  borderBottomRadiusRightRadius: normalize(10),
  cuppon: null,
  btnWidth: null,
  marginStart: 0,
  iconright: null,
  imgheight: normalize(20),
  imgwidth: normalize(20),
  imgrightheight: normalize(20),
  imgrightwidth: normalize(20),
  heightInput: normalize(42),
  onPressssequre: null,
  onPressloginButton: null,
  borderWidth: normalize(0),
  addisSucureBtn: false,
  addloginButton: false,
};
