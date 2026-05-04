import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import { useIsFocused } from '@react-navigation/native';
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
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();

  const userDetails = ProfileReducer?.userDetailsResponse || {};

  // ─── onUpdateProfile params: first_name, last_name, email, profile_pic ───
  const [firstName, setFirstName] = useState(userDetails?.first_name || '');
  const [lastName, setLastName] = useState(userDetails?.last_name || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(
    userDetails?.profile_pic_url || null,
  );

  // ─── Read-only display fields (not sent in update) ───────────────────────
  const [phone, setPhone] = useState(userDetails?.phone || '');
  const [dob, setDob] = useState(userDetails?.dob || '');
  const [dobDate, setDobDate] = useState(
    userDetails?.dob ? new Date(userDetails?.dob) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState(userDetails?.address || '');
  const [municipality, setMunicipality] = useState(userDetails?.municipality || '');
  const [ward, setWard] = useState(userDetails?.ward || '');
  const [district, setDistrict] = useState(userDetails?.district || '');
  const [designation, setDesignation] = useState(userDetails?.designation || '');

  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getuserDetails();
  }, [isFocused]);

  // Sync state when userDetailsResponse changes
  useEffect(() => {
    if (ProfileReducer?.userDetailsResponse) {
      const d = ProfileReducer.userDetailsResponse;
      setFirstName(d?.first_name || '');
      setLastName(d?.last_name || '');
      setEmail(d?.email || '');
      setPhone(d?.phone || '');
      setDob(d?.dob || '');
      setDobDate(d?.dob ? new Date(d?.dob) : new Date());
      setAddress(d?.address || '');
      setMunicipality(d?.municipality || '');
      setWard(d?.ward || '');
      setDistrict(d?.district || '');
      setDesignation(d?.designation || '');
    }
  }, [ProfileReducer?.userDetailsResponse]);

  // Receive photo captured in Attendance page
  useEffect(() => {
    if (props?.route?.params?.finalImageUri) {
      setCapturedImageWithGeotag(props.route.params.finalImageUri);
      props?.navigation.setParams({ finalImageUri: undefined });
    }
  }, [props?.route?.params?.finalImageUri]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setShowDatePicker(false);
    const d = ProfileReducer?.userDetailsResponse || {};
    setFirstName(d?.first_name || '');
    setLastName(d?.last_name || '');
    setEmail(d?.email || '');
    setPhone(d?.phone || '');
    setDob(d?.dob || '');
    setDobDate(d?.dob ? new Date(d?.dob) : new Date());
    setAddress(d?.address || '');
    setMunicipality(d?.municipality || '');
    setWard(d?.ward || '');
    setDistrict(d?.district || '');
    setDesignation(d?.designation || '');
    setCapturedImageWithGeotag(d?.photo || null);
  };

  const handleClickPhoto = () => {
    props?.navigation.navigate('Attendence', { pagename: 'MyProfile' });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dobDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDobDate(currentDate);
    setDob(currentDate.toISOString().split('T')[0]);
  };

  // ─── onUpdateProfile: sends first_name, last_name, email, profile_pic ────
  function onUpdateProfile() {
    if (!firstName.trim()) {
      showErrorAlert('First name is required');
      return;
    }
    if (!lastName.trim()) {
      showErrorAlert('Last name is required');
      return;
    }
    if (!email.trim()) {
      showErrorAlert('Email is required');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);

    if (capturedImageWithGeotag) {
      const imageName = capturedImageWithGeotag.split('/').pop();
      formData.append('profile_pic', {
        uri:
          Platform.OS === 'android'
            ? capturedImageWithGeotag
            : capturedImageWithGeotag.replace('file://', ''),
        name: imageName,
        type: 'image/jpeg',
      });
    }

    connectionrequest()
      .then(() => {
        dispatch(profileUpdateRequest(formData));
      })
      .catch(() => {
        showErrorAlert('Please connect to internet');
      });
  }

  function getuserDetails() {
    connectionrequest()
      .then(() => {
        dispatch(userDetailsRequest());
      })
      .catch(() => {
        showErrorAlert('Please connect to internet');
      });
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
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

  const handleResetPassword = () => {
    if (password !== confirmPassword) {
      showErrorAlert('Confirm password does not match');
      return;
    }
    if (password.length < 6) {
      showErrorAlert('Password must be at least 6 characters long');
      return;
    }
    const obj = {
      id: ProfileReducer?.userDetailsResponse?.id,
      new_password: password,
      confirm_password: confirmPassword,
    };
    connectionrequest()
      .then(() => {
        dispatch(resetPasswordRequest(obj));
        closeResetPasswordModal();
      })
      .catch(() => {
        showErrorAlert('Please connect to internet');
      });
  };

  // ─── Redux status handler ─────────────────────────────────────────────────
  if (status === '' || ProfileReducer.status !== status) {
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
        setLoading(false);
        setIsEditing(false);
        break;
    }
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User Name';

  return (
    <View style={styles.root}>
      <Header
        HeaderLogo
        Title
        placeText={'My Profile'}
        onPress_back_button={() => props.navigation.goBack()}
        onPress_right_button={() => props.navigation.navigate('Notification')}
      />
      <Loader visible={loading} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar & Name ── */}
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
          <Text style={styles.headerName}>{fullName}</Text>
        </View>

        {/* ── Edit / View Fields ── */}
        {isEditing ? (
          <View style={styles.content}>
            {/* Fields that map to onUpdateProfile params */}
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>Editable Fields</Text>
            </View>

            <TextInputWithButton
              show
              icon
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(20)}
              textColor={Colors.textInputColor}
              InputHeaderText={'First Name *'}
              placeholder={'Enter first name'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={firstName}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setFirstName(e)}
              tintColor={Colors.tintGrey}
            />

            <TextInputWithButton
              show
              icon
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(20)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Last Name *'}
              placeholder={'Enter last name'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={lastName}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setLastName(e)}
              tintColor={Colors.tintGrey}
            />

            <TextInputWithButton
              show
              icon
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(20)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Email *'}
              placeholder={'Enter email'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={email}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setEmail(e)}
              tintColor={Colors.tintGrey}
              keyboardType="email-address"
            />

            {/* Read-only info shown for reference */}
            <View style={[styles.sectionLabel, { marginTop: normalize(25) }]}>
              <Text style={styles.sectionLabelText}>Other Details (read-only)</Text>
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Phone</Text>
              <Text style={styles.readOnlyValue}>{phone || 'Not provided'}</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Date of Birth</Text>
              <Text style={styles.readOnlyValue}>{dob || 'Not provided'}</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Designation</Text>
              <Text style={styles.readOnlyValue}>{designation || 'Not provided'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <Text style={styles.fieldValue}>{firstName || 'Not provided'}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <Text style={styles.fieldValue}>{lastName || 'Not provided'}</Text>
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
              <Text style={styles.fieldValue}>{designation || 'Not provided'}</Text>
            </View>
          </View>
        )}

        {/* ── Action Buttons ── */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={onUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, { marginTop: normalize(10), backgroundColor: Colors.lightred }]}
                onPress={openResetPasswordModal}
              >
                <Text style={styles.editButtonText}>Reset Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, { marginTop: normalize(10), backgroundColor: Colors.orange, marginBottom: 100 }]}
                onPress={() => dispatch(logoutRequest())}
              >
                <Text style={styles.editButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Reset Password Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={showResetPasswordModal}
        onRequestClose={closeResetPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeResetPasswordModal}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TextInputWithButton
                show icon
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
                editable
                fontFamily={Fonts.MulishRegular}
                isheadertext
                value={password}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setPassword(e)}
                tintColor={Colors.tintGrey}
                secureTextEntry
              />
              <TextInputWithButton
                show icon
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
                editable
                fontFamily={Fonts.MulishRegular}
                isheadertext
                value={confirmPassword}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setConfirmPassword(e)}
                tintColor={Colors.tintGrey}
                secureTextEntry
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeResetPasswordModal}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleResetPassword}>
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
  root: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: 0, left: 0, right: 0, bottom: 0,
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
  sectionLabel: {
    marginBottom: normalize(5),
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: normalize(8),
  },
  sectionLabelText: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readOnlyField: {
    marginTop: normalize(15),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    backgroundColor: '#f3f3f3',
    borderRadius: normalize(5),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  readOnlyLabel: {
    fontSize: normalize(11),
    color: '#999',
    marginBottom: 2,
    fontWeight: '600',
  },
  readOnlyValue: {
    fontSize: normalize(14),
    color: '#555',
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
  modalCloseButton: { padding: 5 },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: { padding: 20 },
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