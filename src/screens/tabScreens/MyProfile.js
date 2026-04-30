import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import { StackActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../redux/reducer/AuthReducer';
import {
  profileUpdateRequest,
  resetPasswordRequest,
  userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import TextInputWithButton from '../../components/TextInputWithBotton';

let status = '';

const MyProfile = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();

  // Initialize state with userDetailsResponse data
  const userDetails = ProfileReducer?.userDetailsResponse || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(userDetails?.name || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [phone, setPhone] = useState(userDetails?.phone || '');
  const [dob, setDob] = useState(userDetails?.dob || '');
  const [dobDate, setDobDate] = useState(
    userDetails?.dob ? new Date(userDetails?.dob) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState(userDetails?.address || '');
  const [municipality, setMunicipality] = useState(
    userDetails?.municipality || '',
  );
  const [ward, setWard] = useState(userDetails?.ward || '');
  const [district, setDistrict] = useState(userDetails?.district || '');
  const [designation, setDesignation] = useState(
    userDetails?.designation || '',
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  console.log('isEditing>>', isEditing);

  const [loading, setLoading] = useState(false);
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(
    userDetails?.photo || null,
  );

  useEffect(() => {
    getuserDetails();
  }, [isFocused]);
  // Update state when userDetailsResponse changes
  useEffect(() => {
    if (ProfileReducer?.userDetailsResponse) {
      const details = ProfileReducer.userDetailsResponse;
      setName(details?.name || '');
      setEmail(details?.email || '');
      setPhone(details?.phone || '');
      setDob(details?.dob || '');
      setDobDate(details?.dob ? new Date(details?.dob) : new Date());
      setAddress(details?.address || '');
      setMunicipality(details?.municipality || '');
      setWard(details?.ward || '');
      setDistrict(details?.district || '');
      setDesignation(details?.designation || '');
      // setCapturedImageWithGeotag(details?.photo || null);
    }
  }, [ProfileReducer?.userDetailsResponse]);

  // Listen for the returned image from Attendance page
  useEffect(() => {
    if (props?.route?.params?.finalImageUri) {
      setCapturedImageWithGeotag(props.route.params.finalImageUri);
      props?.navigation.setParams({ finalImageUri: undefined });
    }
  }, [props?.route?.params?.finalImageUri]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const openResetPasswordModal = () => {
    setShowResetPasswordModal(true);
    setPassword('');
    setConfirmPassword('');
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = async () => {
    if (password != confirmPassword) {
      showErrorAlert('confirm password does not match');
    } else if (password.length < 6) {
      showErrorAlert('Password must be at least 6 characters long');
    } else {
      let obj = {
        id: ProfileReducer?.userDetailsResponse?.id,
        new_password: password,
        confirm_password: confirmPassword,
      };

      connectionrequest()
        .then(() => {
          console.log(obj);
          dispatch(resetPasswordRequest(obj));
          closeResetPasswordModal();
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    const details = ProfileReducer?.userDetailsResponse || {};
    setName(details?.name || '');
    setEmail(details?.email || '');
    setPhone(details?.phone || '');
    setDob(details?.dob || '');
    setDobDate(details?.dob ? new Date(details?.dob) : new Date());
    setAddress(details?.address || '');
    setMunicipality(details?.municipality || '');
    setWard(details?.ward || '');
    setDistrict(details?.district || '');
    setDesignation(details?.designation || '');

    setCapturedImageWithGeotag(details?.photo || null);
    setShowDatePicker(false);
  };

  const handleClickPhoto = () => {
    props?.navigation.navigate('Attendence', {
      pagename: 'MyProfile',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dobDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDobDate(currentDate);

    // Format date to YYYY-MM-DD for API
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDob(formattedDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  function onUpdateProfile() {
    const imageName = capturedImageWithGeotag?.split('/').pop(); // extract file name
    const imageType = 'image/jpeg';
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('dob', dob);
    formData.append('photo', {
      uri:
        Platform.OS === 'android'
          ? capturedImageWithGeotag
          : capturedImageWithGeotag.replace('file://', ''),
      name: imageName,
      type: imageType,
    });

    connectionrequest()
      .then(() => {
        dispatch(profileUpdateRequest(formData));
      })
      .catch(err => {
        showErrorAlert('Please connect to internet');
      });
  }

  function getuserDetails() {
    connectionrequest()
      .then(() => {
        dispatch(userDetailsRequest());
      })
      .catch(err => {
        showErrorAlert('Please connect to internet');
      });
  }

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/userDetailsRequest':
        status = ProfileReducer.status;
        setLoading(true);
        break;
      case 'Profile/userDetailsSuccess':
        status = ProfileReducer.status;
        setLoading(false);
        break;
      case 'Profile/userDetailsFailure':
        status = ProfileReducer.status;
        setLoading(false);
        break;
      case 'Profile/profileUpdateRequest':
        status = ProfileReducer.status;
        setLoading(true);
        break;
      case 'Profile/profileUpdateSuccess':
        status = ProfileReducer.status;
        setLoading(false);
        setIsEditing(false);
        getuserDetails();
        break;
      case 'Profile/profileUpdateFailure':
        status = ProfileReducer.status;
        setIsEditing(false);
        setLoading(false);
        break;
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Header
        HeaderLogo
        Title
        placeText={'My Profile'}
        onPress_back_button={() => {
          props.navigation.goBack();
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <Loader visible={loading} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={isEditing ? handleClickPhoto : null}
            style={styles.profileImageContainer}
            disabled={!isEditing}
          >
            {capturedImageWithGeotag ? (
              <Image
                resizeMode="cover"
                style={styles.profileImage}
                source={{ uri: capturedImageWithGeotag }}
              />
            ) : (
              <Image source={Images.profilepic} style={styles.profileImage} />
            )}

            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Text style={styles.editImageText}>Tap to change</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerName}>{name || 'User Name'}</Text>
        </View>

        {isEditing ? (
          <View style={styles.content}>
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Full Name'}
              placeholder={'Enter full name'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={name}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setName(e)}
              tintColor={Colors.tintGrey}
            />
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Email'}
              placeholder={'Enter email'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={email}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setEmail(e)}
              tintColor={Colors.tintGrey}
            />
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={showDatepicker}
              >
                <Text style={styles.datePickerText}>
                  {dob ? dob : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dobDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Text style={styles.fieldValue}>{name || 'Not provided'}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{email || 'Not provided'}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.fieldValue}>{phone || 'Not provided'}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <Text style={styles.fieldValue}>{dob || 'Not provided'}</Text>
            </View>
         
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Designation</Text>
              <Text style={styles.fieldValue}>
                {designation || 'Not provided'}
              </Text>
            </View>
         
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  onUpdateProfile();
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[
                  styles.editButton,
                  { marginTop: normalize(10), backgroundColor: Colors.lightred },
                ]} onPress={openResetPasswordModal}>
                <Text style={styles.editButtonText}>Reset Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { marginTop: normalize(10), backgroundColor: Colors.orange ,marginBottom:100},
                ]}
                onPress={() => {
                  dispatch(logoutRequest());
                }}
              >
                <Text style={styles.editButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Reset Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showResetPasswordModal}
        onRequestClose={closeResetPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeResetPasswordModal}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(45)}
                inputWidth={'100%'}
                marginTop={normalize(15)}
                textColor={Colors.textInputColor}
                InputHeaderText={'New Password'}
                placeholder={'Enter new password'}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(15)}
                borderColor={Colors.inputGreyBorder}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={password}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setPassword(e)}
                tintColor={Colors.tintGrey}
                secureTextEntry={true}
              />
              
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(45)}
                inputWidth={'100%'}
                marginTop={normalize(15)}
                textColor={Colors.textInputColor}
                InputHeaderText={'Confirm Password'}
                placeholder={'Confirm new password'}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(15)}
                borderColor={Colors.inputGreyBorder}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={confirmPassword}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setConfirmPassword(e)}
                tintColor={Colors.tintGrey}
                secureTextEntry={true}
              />
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeResetPasswordModal}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleResetPassword}
              >
                <Text style={styles.modalSubmitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
    paddingBottom: normalize(60),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
  },
  scrollViewContent: {
    paddingBottom: normalize(100),
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonContainer: {
    padding: 20,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    marginTop: normalize(25),
  },
  datePickerLabel: {
    fontSize: normalize(13),
    color: Colors.textInputColor,
    marginBottom: normalize(5),
    fontFamily: Fonts.MulishRegular,
  },
  datePickerButton: {
    height: normalize(45),
    borderWidth: 1,
    borderColor: Colors.skyblue,
    borderRadius: normalize(5),
    paddingLeft: normalize(10),
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  datePickerText: {
    fontSize: normalize(14),
    color: Colors.textInputColor,
    fontFamily: Fonts.MulishRegular,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  modalCancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubmitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyProfile;