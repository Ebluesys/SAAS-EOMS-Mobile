import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import TextInputWithButton from '../../components/TextInputWithBotton';
import DatePicker from 'react-native-date-picker';
import normalize from '../../utils/helpers/normalize';
import Modal from 'react-native-modal';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyLeaveRequest,
  holidayListRequest,
  remainingLeavesRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { Dropdown } from 'react-native-element-dropdown';
import { useIsFocused } from '@react-navigation/native';
import constants from '../../utils/helpers/constants';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MessageModal from '../../components/MessageModal';

let status = '';
const ApplyLeave = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const isFocused = useIsFocused();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [leaveType, setLeaveType] = useState([]);
  const [isFocusTask, setIsFocusTask] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState(null);
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHolidayVisible, setIsHolidayVisible] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [supportingDocument, setSupportingDocument] = useState(null);
  console.log('leaveType>>>>>>>>>', leaveType);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [showFileOptions, setShowFileOptions] = useState(false);

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(
            remainingLeavesRequest(ProfileReducer?.userDetailsResponse?.id),
          );

          dispatch(
            holidayListRequest(130),
          );
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused]);

  // Add this useEffect to format the leave type data when it's received
  useEffect(() => {
    if (ProfileReducer?.remainingLeavesResponse?.leaves?.length > 0) {
      const formattedLeaveTypes =
        ProfileReducer?.remainingLeavesResponse?.leaves.map(leave => ({
          ...leave,
          formatted_label: `${leave.leave_type_name}`,
        }));
      setLeaveType(formattedLeaveTypes);
    }
  }, [ProfileReducer?.remainingLeavesResponse]);

  // Optional: Add custom render item for dropdown if you want more styling control
  const renderDropdownItem = item => {
    const isLowBalance = parseInt(item.remaining_leaves) <= 2;
    const isNoBalance = parseInt(item.remaining_leaves) === 0;

    return (
      <View style={styles.dropdownItem}>
        <Text
          style={[
            styles.dropdownItemText,
            isNoBalance && styles.noBalanceText,
            isLowBalance && !isNoBalance && styles.lowBalanceText,
          ]}
        >
          {item.leave_type_name}
        </Text>
        <Text
          style={[
            styles.balanceText,
            isNoBalance && styles.noBalanceText,
            isLowBalance && !isNoBalance && styles.lowBalanceText,
          ]}
        >
          ({item.remaining_leaves} remaining out of {item.total_leaves})
        </Text>
      </View>
    );
  };
  // Request camera permission
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Handle file selection options
  const handleFileOptions = () => {
    setShowFileOptions(true);
  };

  // Handle camera option
  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showErrorAlert('Camera permission is required');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, response => {
      setShowFileOptions(false);
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSupportingDocument(response.assets[0]);
      }
    });
  };

  // Handle gallery option
  const handleGallery = () => {
    const options = {
      mediaType: 'mixed', // Allow both photos and videos
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, response => {
      setShowFileOptions(false);
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSupportingDocument(response.assets[0]);
      }
    });
  };

  // Remove selected file
  const removeFile = () => {
    setSupportingDocument(null);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.nameColumn]}>Holiday Name</Text>
        <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
      </View>
    </View>
  );

  const renderHolidayItem = ({ item, index }) => (
    <View
      style={[
        styles.itemContainer,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text style={[styles.itemText, styles.nameColumn, styles.holidayName]}>
        {item.holiday_name}
      </Text>
      <Text style={[styles.itemText, styles.dateColumn]}>
        {moment(item?.holiday_date).format('YYYY-MM-DD')}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>Total holidays: {holidays.length}</Text>
    </View>
  );

  const formatDate = date => {
    return moment(date).format('YYYY-MM-DD');
  };

  const formatDateForDisplay = date => {
    return moment(date).format('DD/MM/YYYY');
  };

  const calculateLeaveDays = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff;
  };

  const handleStartDateConfirm = selectedDate => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);
    if (selectedDate > endDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEndDateConfirm = selectedDate => {
    setShowEndDatePicker(false);
    if (selectedDate >= startDate) {
      setEndDate(selectedDate);
    } else {
      Alert.alert('Invalid Date', 'End date cannot be before start date');
    }
  };

  const handleStartDateCancel = () => {
    setShowStartDatePicker(false);
  };

  const handleEndDateCancel = () => {
    setShowEndDatePicker(false);
  };

  function handleSubmit() {
    const imageName = supportingDocument?.uri.split('/').pop();
    const imageType = 'image/jpeg';
    if (selectedLeaveTypeId == null) {
      showErrorAlert('Please Select a valid leave Type.');
    } else if (reason == '') {
      showErrorAlert('Please describe reason for leave.');
    } else if (
      (selectedLeaveTypeId == 11 || selectedLeaveTypeId == 13) &&
      !supportingDocument
    ) {
      showErrorAlert('Please upload supporting document.');
    } else {
      const formData = new FormData();
      formData.append('start_date', formatDate(startDate));
      formData.append('end_date', formatDate(endDate));
      formData.append('leave_gov_type', selectedLeaveTypeId);
      formData.append('reason', reason);
      formData.append('app_version', constants.APP_VERSION);
      supportingDocument?.uri != undefined &&
        formData.append('photo', {
          uri:
            Platform.OS === 'android'
              ? supportingDocument?.uri
              : supportingDocument?.uri.replace('file://', ''),
          name: imageName,
          type: imageType,
        });
      connectionrequest()
        .then(() => {
          dispatch(applyLeaveRequest(formData));
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }

  // useEffect(() => {
  //   if (ProfileReducer?.remainingLeavesResponse?.leaves?.length > 0) {
  //     setLeaveType(ProfileReducer?.remainingLeavesResponse?.leaves);
  //   }
  // }, [ProfileReducer?.remainingLeavesResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/applyLeaveRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/applyLeaveSuccess':
        status = ProfileReducer.status;
        console.log('Hello>>>=applyLeaveSuccess=>>', ProfileReducer);

        setStartDate(new Date());
        setEndDate(new Date());
        setSelectedLeaveTypeId(null);
        setSelectedLeaveTypeName('');
        setReason('');
        setSupportingDocument(null); // Reset supporting document on success
        break;
      case 'Profile/applyLeaveFailure':
        status = ProfileReducer.status;
        console.log('Hello>>>=applyLeaveFailure=>>', ProfileReducer);

        break;
      case 'Profile/holidayListRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/holidayListSuccess':
        status = ProfileReducer.status;
        setHolidays(ProfileReducer?.holidayListResponse);
        break;
      case 'Profile/holidayListFailure':
        status = ProfileReducer.status;
        break;
    }
  }

  return (
    <>
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveTypeRequest' ||
          ProfileReducer?.status == 'Profile/applyLeaveRequest'
        }
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: normalize(20),
          paddingTop: normalize(20),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setIsHolidayVisible(!isHolidayVisible);
          }}
          style={{
            backgroundColor: Colors.white,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-end',
            borderRadius: 8,
          }}
        >
          <Image
            style={{ tintColor: Colors.skyblue, height: 30, width: 30 }}
            source={Images.tab2}
          />
        </TouchableOpacity>

        {/* Start Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDateForDisplay(startDate)}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* End Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDateForDisplay(endDate)}</Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Leave Type Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Leave Type *</Text>
          <Dropdown
            style={[styles.dropdown, isFocusTask && { borderColor: '#24bcf7' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            containerStyle={styles.dropdownListContainer}
            itemTextStyle={styles.dropdownItemText}
            data={leaveType}
            renderItem={renderDropdownItem}
            maxHeight={300}
            labelField="formatted_label" 
            valueField="leave_type_id"
            placeholder={!isFocusTask ? 'Select Leave Type' : '...'}
            searchPlaceholder="Search..."
            value={selectedLeaveTypeId}
            onFocus={() => setIsFocusTask(true)}
            onBlur={() => setIsFocusTask(false)}
            onChange={item => {
              setSelectedLeaveTypeName(item.leave_type_name);

              if (item?.remaining_leaves == 0) {
                setShowMessageModal(true);
              } else {
                setSelectedLeaveTypeId(item.leave_type_id);
                setIsFocusTask(false);
              }
            }}
            renderLeftIcon={() => <Text style={styles.icon}>🗓️</Text>}
          />
        </View>
        <MessageModal
          isVisible={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
          }}
          message={`You have no available ${selectedLeaveTypeName}`}
          okLabel="OK"
        />
        {/* Total Days Display */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Leave Days</Text>
            <Text style={styles.summaryValue}>
              {calculateLeaveDays()}{' '}
              {calculateLeaveDays() === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>

        {/* Reason Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Reason for Leave *</Text>
          <TextInputWithButton
            show={true}
            icon={true}
            height={normalize(45)}
            inputWidth={'100%'}
            textColor={Colors.white}
            placeholder={'Reason'}
            placeholderTextColor={Colors.black}
            paddingLeft={normalize(25)}
            borderColor={Colors.white}
            borderRadius={normalize(5)}
            editable={true}
            fontFamily={Fonts.MulishRegular}
            isheadertext={true}
            value={reason}
            fontSize={normalize(14)}
            headertxtsize={normalize(13)}
            onChangeText={setReason}
            tintColor={Colors.white}
            multiline={true}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{reason.length}/500</Text>
        </View>

        {/* Supporting Document Section */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Supporting Document{' '}
            {selectedLeaveTypeId == 11 || selectedLeaveTypeId == 13
              ? ''
              : '(Optional)'}
          </Text>

          {supportingDocument ? (
            <View style={styles.fileContainer}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>
                  {supportingDocument.fileName || 'Selected file'}
                </Text>
                <Text style={styles.fileSize}>
                  {supportingDocument.fileSize
                    ? `${(supportingDocument.fileSize / 1024).toFixed(1)} KB`
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeFile}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileOptions}
            >
              <Text style={styles.uploadIcon}>📎</Text>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,{marginBottom:100}
          ]}
          onPress={() => {
            handleSubmit();
          }}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Applying...' : 'Apply Leave'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={handleStartDateCancel}
        minimumDate={new Date()}
        title="Select Start Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={handleEndDateCancel}
        minimumDate={startDate}
        title="Select End Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* File Options Modal */}
      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.5}
        hideModalContentWhileAnimating={true}
        isVisible={showFileOptions}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        animationInTiming={300}
        animationOutTiming={300}
        onBackdropPress={() => setShowFileOptions(false)}
      >
        <View style={styles.fileOptionsContainer}>
          <Text style={styles.fileOptionsTitle}>Select Option</Text>

          <TouchableOpacity style={styles.fileOption} onPress={handleCamera}>
            <Text style={styles.fileOptionIcon}>📷</Text>
            <Text style={styles.fileOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fileOption} onPress={handleGallery}>
            <Text style={styles.fileOptionIcon}>📁</Text>
            <Text style={styles.fileOptionText}>Choose from Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelOption}
            onPress={() => setShowFileOptions(false)}
          >
            <Text style={styles.cancelOptionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Holiday Modal */}
      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.1}
        hideModalContentWhileAnimating={true}
        isVisible={isHolidayVisible}
        style={{ width: '100%', alignSelf: 'center', margin: 0 }}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setIsHolidayVisible(!isHolidayVisible)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -25,
              right: normalize(0),
              zIndex: 99,
            }}
            onPress={() => {
              setIsHolidayVisible(!isHolidayVisible);
            }}
          >
            <Image
              source={Images.cross}
              style={{
                height: normalize(60),
                width: normalize(60),
                zIndex: 99,
              }}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Holiday Calendar</Text>

          <FlatList
            data={holidays}
            keyExtractor={item => item.id}
            renderItem={renderHolidayItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
};

export default ApplyLeave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bgColor,
  },
  modalContainer: {
    height: normalize(550),
    backgroundColor: '#808080',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: normalize(10),
    paddingTop: 20,
    paddingBottom: normalize(100),
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dateIcon: {
    fontSize: 20,
  },
  summaryCard: {
    backgroundColor: '#e8f6f3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
    marginTop: 2,
  },
  characterCount: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    elevation: 1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginTop: normalize(10),
  },
  flatList: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerContainer: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  itemText: {
    fontSize: 14,
    color: '#495057',
  },
  holidayName: {
    fontWeight: '500',
    color: '#212529',
  },
  nameColumn: {
    flex: 2,
  },
  dateColumn: {
    flex: 1.5,
  },
  footerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: '#2494ea',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dropdownListContainer: {
    backgroundColor: Colors.greytext,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItemText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
    fontSize: 18,
  },
  // File upload styles
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 1,
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // File options modal styles
  fileOptionsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  fileOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  fileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileOptionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  fileOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  cancelOption: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
   dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  balanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lowBalanceText: {
    color: '#ff9500', // Orange for low balance
  },
  noBalanceText: {
    color: '#ff3b30', // Red for no balance
  },
});
