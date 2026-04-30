import React, { createContext, useContext, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from './normalize';

const CustomAlertContext = createContext();

export const useCustomAlert = () => useContext(CustomAlertContext);

export const CustomAlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // new

  const showAlert = (msg, type = 'success') => {
    setMessage(msg);
    setAlertType(type);
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  return (
    <CustomAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        isVisible={visible}
        animationIn="fadeIn"
        animationOut="fadeOutDown"
        backdropOpacity={0.4}
        backdropTransitionOutTiming={0}
        onBackdropPress={hideAlert}
        onBackButtonPress={hideAlert}
        useNativeDriver
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={hideAlert}>
            <Image
              resizeMode="contain"
              style={styles.iconImage1}
              source={Images.cross}
            />
          </TouchableOpacity>

          <Image
            resizeMode="cover"
            style={[
              styles.iconImage,
              { tintColor: alertType != 'success' ? Colors.red :Colors.skyblue },
            ]}
            source={Images.alert}
          />

          <Text style={styles.modalTitle}>{message}</Text>

          <TouchableOpacity style={styles.okButton} onPress={hideAlert}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  iconImage1: {
    width: normalize(60),
    height: normalize(60),
    top: -15,
    right: -20,
  },
  iconImage: {
    width: normalize(70),
    height: normalize(70),
    alignSelf: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.MulishBold,
    textAlign: 'center',
    color: '#333',
    width: '100%',
    marginBottom: normalize(10),
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  okButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
