import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { Fonts, Images, Colors } from '../themes/ThemePath'; // Adjust path as needed
import constants from '../utils/helpers/constants';

const UpdateModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      isVisible={isVisible}
      backdropColor="black"
      backdropOpacity={0.8}
      animationIn="slideInDown"
      animationOut="slideOutDown"
      swipeDirection={['down']}
      avoidKeyboard={true}
      style={{ justifyContent: 'center', alignItems: 'center' }}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.modalMainConatiner}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Image source={Images.cross} style={styles.closeIcon} />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Image source={Images.googleplay} style={styles.appIconSmall} />
            <Text style={styles.titleText}>Update from google play store</Text>
          </View>
        </View>

        <Text style={styles.updateTitle}>Update available (V{constants?.APP_VERSION})</Text>
        <Text style={styles.updateSubtitle}>
          To use this app, download the latest version
        </Text>

        <View style={styles.appRow}>
          <Image source={Images.appicon} style={styles.appIconLarge} />
          <Text style={styles.appName}>e-Attendence</Text>
        </View>

        <Text style={styles.infoText}>
          For any further information please contact to Hr.
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.red }]}
            onPress={onClose}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() =>
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.ebsoms.app&pcampaignid=web_share',
              )
            }
          >
            <Image source={Images.googleplay} style={styles.playstoreIcon} />
            <Text style={styles.btnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  modalMainConatiner: {
    borderRadius: 15,
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
  },
  closeIcon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  appIconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
  },
  titleText: {
    fontSize: 16,
    marginLeft: 10,
    color: 'black',
  },
  updateTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: '500',
    marginTop: 15,
  },
  updateSubtitle: {
    fontSize: 14,
    color: 'black',
    fontWeight: '400',
    marginTop: 5,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  appIconLarge: {
    width: 35,
    height: 35,
    borderRadius: 5,
    overflow: 'hidden',
  },
  appName: {
    fontSize: 14,
    color: 'black',
    fontFamily: Fonts.MulishSemiBold,
  },
  infoText: {
    fontSize: 14,
    color: 'grey',
    fontWeight: '400',
    marginTop: 20,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  primaryBtn: {
    width: '48%',
    backgroundColor: '#1d8348',
    marginHorizontal: 12,
    borderRadius: 30,
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 10,
  },
  downloadBtn: {
    width: '48%',
    backgroundColor: '#1d8348',
    marginHorizontal: 12,
    borderRadius: 30,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  playstoreIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  btnText: {
    color: 'white',
    fontFamily: 'montserratbold',
    fontSize: 16,
    fontWeight: '600',
  },
});
