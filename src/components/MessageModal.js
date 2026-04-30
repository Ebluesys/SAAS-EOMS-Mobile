import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { Fonts, Images, Colors } from '../themes/ThemePath';

const MessageModal = ({
  isVisible,
  onClose,
  onOkPress,
  okLabel = 'OK',
  message = 'To use this app, download the latest version',
  appName = 'e-Attendence',
  appIcon = Images.appicon,
}) => {
  const handleOk = () => {
    if (onOkPress) {
      onOkPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      backdropColor="black"
      backdropOpacity={0.7}
      animationIn="zoomIn"
      animationOut="zoomOut"
      swipeDirection={['down']}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={styles.modalContainer}>
        {/* <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Image source={Images.cross} style={styles.closeIcon} />
        </TouchableOpacity> */}
          <Image source={appIcon} style={styles.appIconLarge} />


        <Text style={styles.updateSubtitle}>{message}</Text>

       


        <TouchableOpacity style={styles.okBtn} onPress={handleOk}>
          <Text style={styles.btnText}>{okLabel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default MessageModal;

const styles = StyleSheet.create({
  modalContainer: {
    borderRadius: 15,
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 2,
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    fontWeight: 'bold',
  },
  updateTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: '600',
    marginTop: 10,
  },
  updateSubtitle: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  appIconLarge: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  appName: {
    fontSize: 16,
    color: 'black',
    fontFamily: Fonts.MulishSemiBold,
  },
  infoText: {
    fontSize: 13,
    color: 'grey',
    marginTop: 20,
    textAlign: 'center',
  },
  okBtn: {
    marginTop: 25,
    backgroundColor: Colors.primary || '#1d8348',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  btnText: {
    color: 'white',
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
  },
});
