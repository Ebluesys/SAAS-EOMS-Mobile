import React, {Fragment, useState} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import Modal from 'react-native-modal';

import PropTypes from 'prop-types';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import normalize from '../utils/helpers/normalize';
import {Colors, Fonts, Images} from '../themes/ThemePath';

export default function DrawerMenu(props) {
  const [modalVisible, setModalVisible] = useState(props.modalVisible);
  const [open, setOpen] = useState(false);
  const [modalOpen, setmodalOpen] = useState(false);

  function onBackdropPress() {
    if (props.onBackdropPress) {
      props.onBackdropPress();
    }
  }

  const navigation = useNavigation();
  const profileData = [
    {
      id: 0,
      icon: Images.drawer1,
      name: 'Order History',
    },
    {
      id: 1,
      icon: Images.drawer2,
      name: 'Product management',
    },
    {
      id: 2,
      icon: Images.drawer3,
      name: 'Promotions',
    },

    {
      id: 3,
      icon: Images.drawer4,
      name: 'Sales Analytics',
    },
    {
      id: 4,
      icon: Images.drawer5,
      name: 'Earning',
    },
    {
      id: 5,
      icon: Images.drawer6,
      name: 'Review & Ratings',
    },
    {
      id: 6,

      icon: Images.drawer7,
      name: 'My Profile',
    },
    {
      id: 7,
      icon: Images.drawer8,
      name: 'Payment History',
    },
  ];
  function menuRender({item, index}) {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            index == 0 && navigation.navigate('OrderHistory'),
              onBackdropPress(),
              index == 1 && navigation.navigate('CategoryManagement');

            index == 2 && navigation.navigate('Promotion'),
              index == 3 && navigation.navigate('SalesAnalytics'),
              index == 4 && navigation.navigate('Earning');
            index == 5 && navigation.navigate('ReviewandRating');
            index == 6 && navigation.navigate('MyProfile'),
              index == 7 && navigation.navigate('PaymentHistory');
          }}
          style={{
            flexDirection: 'row',
            height: normalize(45),
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={item?.icon}
              style={{
                height: normalize(18),
                width: normalize(18),
                marginHorizontal: normalize(20),
                tintColor: '#B7B7B7',
              }}
              resizeMode="contain"
            />

            <Text
              style={{
                color: '#373D3F',
                fontFamily: Fonts.MulishMedium,
                fontSize: normalize(12),
                textTransform: 'capitalize',
              }}>
              {item?.name}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <Modal
      animationIn={'fadeInLeftBig'}
      animationOut={'fadeOutLeftBig'}
      animationInTiming={600}
      animationOutTiming={600}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating={true}
      useNativeDriver={true}
      backdropOpacity={0.7}
      isVisible={props.modalVisible}
      style={{margin: 0}}
      onBackdropPress={() => {
        onBackdropPress();
      }}>
      <Fragment>
        {/* <MyStatusBar
          barStyle={'dark-content'}
          backgroundColor={Colors.lightGreen}
        /> */}

        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            width: '80%',
            borderTopRightRadius: normalize(15),
            borderBottomRightRadius: normalize(15),
            backgroundColor: Colors.white,
          }}>
          <View
            style={{
              flex: 1,
              borderTopRightRadius: normalize(15),
              borderBottomRightRadius: normalize(15),
              backgroundColor: Colors.white,
              width: '100%',
              overflow: 'hidden',
            }}>
            <ImageBackground
              source={Images.drawerbg}
              style={{
                height: normalize(120),
                marginBottom: normalize(10),
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                onPress={() => {
                  onBackdropPress();
                }}>
                <Image
                  source={Images.cross}
                  style={{
                    height: normalize(13),
                    width: normalize(13),
                    alignSelf: 'flex-end',
                    right: normalize(15),
                    marginTop:
                      Platform.OS == 'android' ? normalize(25) : normalize(35),
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop:
                    Platform.OS == 'android' ? normalize(20) : normalize(10),
                  width: '100%',
                  paddingHorizontal: normalize(10),
                }}>
                <View
                  style={{
                    padding: normalize(5),
                    borderColor: 'rgb(150,222,242)',
                    borderWidth: normalize(1),
                    borderRadius: normalize(100),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.dummyProfile}
                    style={{
                      height: normalize(35),
                      width: normalize(35),
                      borderRadius: normalize(100),
                    }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{marginLeft: normalize(8)}}>
                  <Text style={styles.fontBold}>Catering quality food</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      // marginTop: normalize(25),
                      // width:'100%',
                      // paddingHorizontal:normalize(10)
                    }}>
                    <Image
                      source={Images.location}
                      style={{
                        height: normalize(10),
                        width: normalize(8),
                        borderRadius: normalize(100),
                      }}
                      resizeMode="contain"
                    />
                    <Text numberOfLines={1} style={styles.fontReguler}>
                      3892 Thomas Drive, NY
                    </Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
            <FlatList
              data={profileData}
              renderItem={menuRender}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Fragment>
    </Modal>
  );
}

DrawerMenu.propTypes = {
  modalVisible: PropTypes.bool,
  title: PropTypes.string,
  data: PropTypes.array,
  renderItem: PropTypes.func,
  onBackdropPress: PropTypes.func,
  onPressCross: PropTypes.func,
  profilePic: PropTypes.string,
  full_name: PropTypes.string,
  phone_no: PropTypes.string,
};

DrawerMenu.defaultProps = {
  modalVisible: false,
  title: '',
  data: [],
  renderItem: () => {},
  onBackdropPress: () => {},
  onPressCross: () => {},
  profilePic: '',
  full_name: '',
  phone_no: '',
};
const styles = StyleSheet.create({
  menutxt: {
    color: 'black',
    fontSize: normalize(12),
    fontFamily: Platform?.OS == 'ios' ? Fonts.MulishMedium : Fonts.MulishMedium,
    // alignSelf: 'center',
    width: normalize(150),
  },
  fontBold: {
    fontFamily: Fonts.MulishBold,
    fontSize: normalize(12),
    color: Colors.textInputColor,
  },
  fontReguler: {
    fontFamily: Fonts.MulishMedium,
    fontSize: normalize(12),
    color: Colors.white,
    width: '80%',
    marginLeft: normalize(5),
  },
});
