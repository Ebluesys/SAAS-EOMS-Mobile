import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import {Colors, Fonts} from '../themes/ThemePath';
import normalize from '../utils/helpers/normalize';
export default function TextInputWithButton(props) {
  const inputRef = useRef(null);
  const [blurview, setblurview] = useState(false);
  const [headerTaxt, setHeaderTaxt] = useState(false);

  function onChangeText(text) {
    text.length > 0 ? setHeaderTaxt(true) : setHeaderTaxt(false);

    if (props.onChangeText) {
      props.onChangeText(text);
    }
  }

  function onPress() {
    if (props.onPress) {
      props.onPress();
    }
  }

  function onRightPress() {
    if (props.onRightPress) {
      props.onRightPress();
    }
  }
  useEffect(() => {
    if (props.focus == true) {
      Platform.OS === 'ios'
        ? inputRef.current.focus()
        : setTimeout(() => inputRef.current.focus(), 600);
    }
  }, [props.focus]);
  return (
    <>
      <TouchableOpacity
        onPress={() => onPress()}
        activeOpacity={props.activeOpacity}
        style={{
          backgroundColor: props.backgroundColor,
          borderRadius: props.borderRadius,
          alignItems: 'flex-start',
          justifyContent: 'center',
          borderColor: Colors.lightBlue,
          borderWidth: normalize(1),
          marginTop: props.marginTop,
          width: props.inputWidth,
          zIndex: 99,
          paddingVertical: 2,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: props.width,
            height: props.height,
            borderWidth: props.borderWidth,
            borderColor: props.borderColor,
            borderRadius: props.borderRadius,
            borderBottomColor: props.borderBottomColor,
            paddingHorizontal: normalize(5),
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{width: '85%'}}>
            {headerTaxt && (
              <Text
                style={{
                  color: Colors.skyblue,
                  fontSize: normalize(10),
                  fontFamily: Fonts.MulishRegular,
                  marginTop: normalize(10),
                  marginLeft: normalize(5),
                  marginBottom:
                    Platform.OS == 'ios' ? normalize(5) : normalize(-5),
                }}>
                {props.InputHeaderText}
              </Text>
            )}
            <TextInput
              ref={inputRef}
              style={[
                {
                  // flex: 1,
                  height: props.inputheight,
                  marginTop: props.textMargin,
                  paddingLeft: props.textInputLeft,
                  textAlign: props.textAlign,
                  letterSpacing: props.letterSpacing,
                  color: props.textColor,
                  marginLeft: normalize(5),
                  fontFamily: Fonts.MulishRegular,
                  fontSize: props.fontSize,
                  shadowColor: props.shadowColor,
                  shadowOffset: props.shadowOffset,
                  shadowOpacity: props.shadowOpacity,
                  shadowRadius: props.shadowRadius,
                  elevation: props.elevation,
                  marginBottom: normalize(8),
                  top: headerTaxt ? 0 : 5,
                  width: '100%',
                },
              ]}
              maxLength={props.maxLength}
              multiline={props.multiline}
              returnKeyType={props.returnKeyType}
              numberOfLines={props.numberOfLines}
              autoCapitalize={props.autoCapitalize}
              placeholder={props.placeholder}
              editable={props.editable}
              spellCheck={false}
              placeholderTextColor={Colors.tintGrey}
              textAlignVertical="top"
              keyboardType={props.keyboardType}
              value={props.value}
              onChangeText={text => {
                onChangeText(text);
              }}
              onBlur={() => {
                setblurview(false);
              }}
              onFocus={() => setblurview(true)}
              secureTextEntry={props?.secureTextEntry}
            />
          </View>
          {props.isRightIconVisible && (
            <TouchableOpacity onPress={() => onRightPress()}>
              <Image
                source={props.rightimage}
                resizeMode="contain"
                style={{
                  marginRight: normalize(1),
                  width: props.rightimageheight,
                  height: props.rightimagewidth,
                  tintColor: props.tintColor,
              
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
}

TextInputWithButton.propTypes = {
  marginLeft: PropTypes.number,
  marginTop: PropTypes.number,
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
  numberOfLines: PropTypes.number,
  fontSize: PropTypes.number,
  editable: PropTypes.bool,
  borderColor: PropTypes.string,
  fontWeight: PropTypes.any,
  textAlign: PropTypes.string,
  onPress: PropTypes.func,
  search: PropTypes.bool,
  borderRadius: PropTypes.any,
  borderRadiusLeftRadius: PropTypes.any,
  borderBottomRadiusRightRadius: PropTypes.any,
  icon: PropTypes.any,
  iconleft: PropTypes.any,
  iconright: PropTypes.any,
  fontFamily: PropTypes.any,
  backgroundColor: PropTypes.any,
  width: PropTypes.any,
  height: PropTypes.any,
  marginBottom: PropTypes.number,
  borderWidth: PropTypes.number,
  leftIcon: PropTypes.string,
  rightIcon: PropTypes.string,
  isleftIconVisible: PropTypes.bool,
  isRightIconVisible: PropTypes.bool,
  textInputLeft: PropTypes.number,
  textColor: PropTypes.string,
  doller: PropTypes.bool,
  elevation: PropTypes.number,
  shadowRadius: PropTypes.number,
  shadowOpacity: PropTypes.number,
  shadowOffset: PropTypes.object,
  shadowColor: PropTypes.string,
  viewbordercolor: PropTypes.string,
  rightimage: PropTypes.string,
  leftimage: PropTypes.string,
  rightimageheight: PropTypes.number,
  rightimagewidth: PropTypes.number,

  leftimage: PropTypes.string,
  leftimageheight: PropTypes.number,
  leftimagewidth: PropTypes.number,

  isheadertext: PropTypes.bool,
  headertext: PropTypes.string,
  headertxtcolor: PropTypes.string,
  headertxtsize: PropTypes.number,
  tintColor: PropTypes.string,
  borderBottomColor: PropTypes.string,
};

TextInputWithButton.defaultProps = {
  alignItems: 'center',
  activeOpacity: 1,
  shadowColor: '',
  shadowOffset: null,
  shadowRadius: 0,
  shadowOpacity: 0,
  elevation: 0,
  marginTop: 0,
  maxLength: 100000,
  isSecure: false,
  multiline: false,
  numberOfLines: 100,
  autoCapitalize: 'none',
  placeholder: '',
  placeholderTextColor: Colors.lightGrey,
  keyboardType: 'default',
  value: '',
  onChangeText: null,
  color: Colors.black,
  editable: true,
  borderColor: '#DDDDDD',
  onFocus: null,
  onBlur: null,
  letterSpacing: 0,
  fontSize: normalize(12),
  textAlign: 'left',
  caretHidden: false,
  borderRadius: normalize(5),
  icon: null,
  iconleft: null,
  borderBottomColor: null,
  fontFamily: Fonts.MulishRegular,
  fontWeight: '400',
  backgroundColor: Colors.white,
  search: false,
  width: '100%',
  height: normalize(42),
  borderRadiusRightRadius: normalize(10),
  borderBottomRadiusRightRadius: normalize(10),
  marginBottom: normalize(15),
  borderWidth: 0,
  leftIcon: '',
  rightIcon: '',
  isleftIconVisible: false,
  isRightIconVisible: false,
  textInputLeft: 0,
  textColor: Colors.black,
  doller: false,
  rightimageheight: normalize(20),
  rightimagewidth: normalize(20),
  leftimageheight: normalize(20),
  leftimagewidth: normalize(20),
  isheadertext: false,
  headertxtcolor: '#848484',
  headertxtsize: normalize(8),
};
