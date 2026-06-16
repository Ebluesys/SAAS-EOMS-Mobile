import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import normalize from '../utils/helpers/normalize';
import { Fonts, Images } from '../themes/ThemePath';
import constants from '../utils/helpers/constants';
import { useAppTheme } from '../themes/ThemeContext';

function Header(props) {
  const { colors } = useAppTheme();

  const title = props?.Title ? (
    <Text style={[styles.title, { color: colors.white }]}>{props.placeText}</Text>
  ) : null;

  return (
    <>
      {props?.HeaderLogo ? (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.skyblue,
              paddingHorizontal: normalize(15),
            },
          ]}
        >
          <TouchableOpacity style={styles.leadingSpace} onPress={props.onPress_back_button} />

          {title}

          {props.midImage ? (
            <Image
              resizeMode="contain"
              source={Images.appName}
              style={styles.midImage}
            />
          ) : null}

          <View style={styles.trailingContent}>
            <Text style={[styles.version, { color: colors.white }]}>
              v{constants?.APP_VERSION}
            </Text>
          </View>
        </View>
      ) : null}

      {props?.HeaderGoBacklogo ? (
        <View style={styles.backHeader}>
          <TouchableOpacity onPress={props.onPress_back_button}>
            <Image
              resizeMode="contain"
              source={Images.backbutton2}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          {title}

          <View style={styles.backIconSpacer} />
        </View>
      ) : null}
    </>
  );
}

export default Header;

const styles = StyleSheet.create({
  header: {
    zIndex: 99,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: normalize(65),
    paddingTop: 10,
    width: '100%',
  },
  leadingSpace: {
    width: normalize(50),
  },
  title: {
    fontSize: normalize(15),
    fontFamily: Fonts.MulishBold,
    textAlign: 'center',
  },
  midImage: {
    height: normalize(25),
    width: normalize(70),
  },
  trailingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 90,
  },
  version: {
    fontFamily: Fonts.MulishBold,
    fontWeight: 'bold',
    fontSize: normalize(12),
    textTransform: 'capitalize',
  },
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(15),
    height: normalize(50),
    marginBottom: normalize(5),
  },
  backIcon: {
    height: normalize(30),
    width: normalize(30),
  },
  backIconSpacer: {
    height: normalize(30),
    width: normalize(30),
  },
});
