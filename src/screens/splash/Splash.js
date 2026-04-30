import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { Images } from '../../themes/ThemePath';

const Splash = props => {
  //  useEffect(() => {
  //   setTimeout(() => {
  //     props?.navigation.replace('Signin');
  //   }, 2000);
  // }, []);
  return (
    <ImageBackground
      style={{ flex: 1,justifyContent:'center',alignItems:'center' }}
      source={Images.pageBackground}
      resizeMode="cover"
    >
      <Image
        source={Images.appicon}
        style={{
          height: normalize(150),
          width: normalize(150),
        }}
        resizeMode="contain"
      />
    </ImageBackground>
  );
};

export default Splash;

const styles = StyleSheet.create({});
