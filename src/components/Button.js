import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageBackground,
} from 'react-native';


import PropTypes from 'prop-types';
import normalize from '../utils/helpers/normalize';
import { Colors } from '../themes/ThemePath';


export default function Button(props) {
  function onPress() {
    if (props.onPress) {
      props.onPress();
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={props.disabled}
      style={{
        height: props.height,
        width: props.width,
        borderRadius: normalize(8),
        backgroundColor: props.backgroundColor,
        justifyContent: props.justifyContent,
        alignItems: 'center',
        alignSelf: props.alignSelf,
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        marginLeft: props.btnmarginLeft,
        marginRight: props.btnmarginRight,
        marginHorizontal: props.marginHorizontal,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor,
        opacity: props.opacity,
        position: props.btnposition,
        bottom: props.btnBottom,
        end: props.btnend,
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(10),
        minWidth: props.minWidth,
        top: props.btntop,
        marginVertical: props.btnmarginVertical,
      }}
      onPress={() => {
        onPress();
      }}>

      <Text
        // numberOfLines={props.numberOfLines}
        style={{
          fontFamily: props.fontFamily,
          color: props.textColor,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
            textTransform: 'capitalize',
        }}>
        {props.title}
      </Text>

    </TouchableOpacity>
  );
}

Button.propTypes = {
  numberOfLines: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.any,
  minWidth: PropTypes.any,
  backgroundColor: PropTypes.string,
  borderRadius: PropTypes.number,
  textColor: PropTypes.string,
  fontSize: PropTypes.number,
  title: PropTypes.string,
  onPress: PropTypes.func,
  alignSelf: PropTypes.string,
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  marginHorizontal: PropTypes.number,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.any,
  fontFamily: PropTypes.any,
  opacity: PropTypes.number,
  issideImage: PropTypes.bool,
  issideImagelogin: PropTypes.bool,
  textAlign: PropTypes.string,
  imgheight: PropTypes.any,
  imgwidth: PropTypes.any,
  isightsideImage: PropTypes.any,
  marginLeft: PropTypes.any,
  fontWeight: PropTypes.any,
  justifyContent: PropTypes.any,
  btnposition: PropTypes.any,
  btnBottom: PropTypes.any,
  sideImage: PropTypes.any,
  imagmarginLeft: PropTypes.any,
  btnend: PropTypes.any,
  paddingHorizontal: PropTypes.any,
  titlesingle: PropTypes.any,
  source: PropTypes.any,
  sideImagesource: PropTypes.any,
  onlyimgheight: PropTypes.any,
  onlyimgwidth: PropTypes.any,
  btnmarginLeft: PropTypes.any,
  btnmarginRight: PropTypes.any,
};

Button.defaultProps = {
  onlyimgheight: normalize(10),
  onlyimgwidth: normalize(10),
  // sideImagesource: Icons.forword,
  // source: Icons.forword,
  numberOfLines: 0,
  height: normalize(40),
  // backgroundColor: COLORS.blue,
  borderRadius: normalize(5),
  // textColor: COLORS.white,
  fontSize: normalize(14),
  title: '',
  onPress: null,
  alignSelf: null,
  marginTop: 0,
  marginBottom: 0,
  marginHorizontal: 0,
  width: '100%',
  borderColor: '',
  borderWidth: 0,
  // fontFamily: Fonts.PoppinsSemiBold,
  opacity: 1,
  // issideImage: false,
  // issideImagelogin: false,
  textAlign: 'center',
  imgheight: normalize(19),
  imgwidth: normalize(19),
  isightsideImage: null,
  // marginLeft: normalize(35),
  fontWeight: '500',
  justifyContent: 'space-around',
  btnposition: 'relative',
  btnBottom: null,
  sideImage: false,
  // imagmarginLeft: normalize(15),
  btnend: null,
  // paddingHorizontal: normalize(0),
  titlesingle: false,
  minWidth: null,
};
