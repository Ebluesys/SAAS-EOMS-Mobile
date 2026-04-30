import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import normalize from '../../utils/helpers/normalize';
import moment from 'moment';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addTaskRequest,
  attendenceStatusRequest,
  complitedTaskListRequest,
  endTaskRequest,
  startTaskRequest,
  taskDoItLaterRequest,
  taskListRequest,
  taskLocationRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import TextInputWithButton from '../../components/TextInputWithBotton';
import Button from '../../components/Button';
import constants from '../../utils/helpers/constants';
import Header from '../../components/Header';

let status = '';

const AttendenceReport = props => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const isFocused = useIsFocused();
  const [isClocked, setIsClocked] = useState(false);
  const [taskSubmitId, setTaskSubmitId] = useState(null);
  const [taskTrackingId, setTaskTrackingId] = useState(null);

  const [taskAction, setTaskAction] = useState(null);
  const [endTaskModal, setEndTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [TaskLocationList, setTaskLocation] = useState([]);
  const [taskSubmit_id, setTaskSubmit_id] = useState();
  const [taskTracking_id, setTaskTracking_id] = useState();

  const [TaskPurposeList, setTaskPurposeList] = useState([]);
  const [complitedTaskData, setComplitedTaskData] = useState([]);

  const [isFocusTask1, setIsFocusTask1] = useState(false);
  const [isFocusTask2, setIsFocusTask2] = useState(false);
  const [selectedTaskLocation, setSelectedTasklocatio] = useState('');
  const [selectedTaskPurpose, setSelectedTaskPurpose] = useState('');
  const [other_location, setOther_location] = useState('');
  const [other_purpose, setOther_purpose] = useState('');

  // New state variables for date/time pickers
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(complitedTaskListRequest(`approved,ongoing,complete`));

    // simulate wait or use Redux status to stop refreshing
    setTimeout(() => setRefreshing(false), 1000);
  };
  // Date/Time picker handlers
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };

  // Fixed dropdown handlers and state management
  const handleTasklocationSelect = async item => {
    setSelectedTasklocatio(item);
    setIsFocusTask1(false);
  };

  const handleTaskPurposeSelect = async item => {
    setSelectedTaskPurpose(item);
    setIsFocusTask2(false);
  };

  useEffect(() => {
    if (isFocused && props?.route?.name == 'Daily Task') {
      connectionrequest()
        .then(() => {
          dispatch(taskListRequest());
          dispatch(taskLocationRequest());
          dispatch(complitedTaskListRequest(`approved,ongoing,complete`));
          dispatch(attendenceStatusRequest());
        })
        .catch(err => {
          showErrorAlert('Please connect to internet');
        });
    } else {
      setAddTaskModal(false);
    }
  }, [isFocused]);
  const buttonResRef = useRef(null);
  const getLocation = async (taskid, buttonRes) => {
    setLoader(true);
    buttonResRef.current = buttonRes;
    setEndTaskModal(false);
    setAddTaskModal(false);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        if (buttonRes == 'start') {
          onStartTask(latitude, longitude, taskid);
        } else if (buttonRes == 'end_task') {
          onEndTask(latitude, longitude, 'end_daily_task');
        } else if (buttonRes == 'return_office') {
          onEndTask(latitude, longitude, 'inside');
        } else if (buttonRes == 'end_day') {
          onEndTask(latitude, longitude, 'day_end');
        } else {
          onAddNewTask(latitude, longitude);
        }
      },
      error => {
        console.log('Error getting location', error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };

  const onAddNewTask = async (lat, long) => {
    setLoader(false);
    if (!selectedTaskPurpose?.id) {
      showErrorAlert('Please select task purpose');
      setLoading(false);
      return;
    }
    if (other_location === '') {
      showErrorAlert('Please enter location details');
      setLoading(false);
      return;
    }
    if (selectedTaskPurpose?.title === 'Others' && other_purpose === '') {
      showErrorAlert('Please enter other purpose details');
      setLoading(false);
      return;
    }
    if (!startDate) {
      showErrorAlert('Please select start date');
      setLoading(false);
      return;
    }
    if (!endDate) {
      showErrorAlert('Please select end date');
      setLoading(false);
      return;
    }

    // Combine date and time for validation
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (endDateTime < startDateTime) {
      showErrorAlert('End date and time must be after start date and time');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('location_id', selectedTaskPurpose?.id);
    formData.append('task_name', other_location);
    // formData.append('task_id', selectedTaskPurpose?.id);
    formData.append('other_purpose', other_purpose);
    formData.append('date', moment(new Date()).format('YYYY-MM-DD'));
    formData.append('time', moment().format('HH:mm:ss'));
    formData.append('createTaskDate', moment(startDate).format('YYYY-MM-DD'));
    formData.append('endTaskDate', moment(endDate).format('YYYY-MM-DD'));
    formData.append('start_time', moment(startTime).format('HH:mm:ss'));
    formData.append('end_time', moment(endTime).format('HH:mm:ss'));
    formData.append('latitude', lat);
    formData.append('longitude', long);
    // formData.append('address', actualAddress);
    formData.append('status', 'approved');
    formData.append('app_version', constants.APP_VERSION);

    connectionrequest()
      .then(() => {
        dispatch(addTaskRequest(formData));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };
  const onStartTask = async (lat, long, taskid) => {
    setLoader(false);
    let obj = {
      id: taskid,
      start_time: moment().format('HH:mm:ss'),
      start_latitude: lat,
      start_longitude: long,
      // start_address: actualAddress,
    };

    connectionrequest()
      .then(() => {
        dispatch(startTaskRequest(obj));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };
  const onDoTaskLater = async (task_submit_id, tracking_add) => {
    setLoader(false);
    let obj = {
      task_submit_id: task_submit_id,
      id: tracking_add,
    };

    connectionrequest()
      .then(() => {
        dispatch(taskDoItLaterRequest(obj));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };

  const onEndTask = async (lat, long, remark) => {
    setLoader(false);
    let obj = {
      id: taskTrackingId,
      task_submit_id: taskSubmitId,
      end_time: moment().format('HH:mm:ss'),
      end_latitude: lat,
      end_longitude: long,
      // end_address: actualAddress,
      task_tracking_remarks: remark,
    };

    connectionrequest()
      .then(() => {
        dispatch(endTaskRequest(obj));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };
  const renderTaskList = ({ item, index }) => {
    // Check if any task is currently ongoing across all tasks
    const isAnyTaskOngoing = complitedTaskData.some(
      task => task.latest_tracking_status === 'ongoing',
    );

    // Check if current date is between createTaskDate and endTaskDate
    const currentDate = moment();
    const startDate = moment(item?.createTaskDate);
    const endDate = moment(item?.endTaskDate);

    // Condition 1: Show buttons only if current date is between task dates
    const shouldShowButtons = currentDate.isBetween(
      startDate,
      endDate,
      'day',
      '[]',
    );

    // Additional condition: If task day is ended (has complete status for today), don't show buttons
    const isTodayTaskEnded = item?.task_tracking?.some(
      tracking =>
        tracking.status === 'complete' &&
        moment(tracking.created_at).isSame(currentDate, 'day'),
    );

    // Final condition to show buttons: shouldShowButtons is true AND today's task is not ended
    const showButtons = shouldShowButtons && !isTodayTaskEnded;

    // Get current task's tracking status
    const currentTaskStatus = item?.latest_tracking_status;

    // Button states based on conditions
    const getButtonStates = () => {
      // Condition 2: If latest_tracking_status is null, End button should be disabled
      if (currentTaskStatus === null) {
        return {
          startButtonDisabled: isAnyTaskOngoing, // Disabled if any other task is ongoing
          startButtonOpacity: isAnyTaskOngoing ? 0.5 : 1,
          endButtonDisabled: true, // Always disabled when status is null
          endButtonOpacity: 0.5,
          doLaterButtonDisabled: true, // Can't do later if not started
          doLaterButtonOpacity: 0.5,
        };
      }

      // Condition 3: If latest_tracking_status is "ongoing", End button visible and Start disabled
      if (currentTaskStatus === 'ongoing') {
        return {
          startButtonDisabled: true, // Start disabled when task is ongoing
          startButtonOpacity: 0.5,
          endButtonDisabled: false, // End button enabled
          endButtonOpacity: 1,
          doLaterButtonDisabled: false, // Do later enabled when task is ongoing
          doLaterButtonOpacity: 1,
        };
      }

      // For other statuses (complete, etc.)
      return {
        startButtonDisabled:
          isAnyTaskOngoing || currentTaskStatus === 'complete',
        startButtonOpacity:
          isAnyTaskOngoing || currentTaskStatus === 'complete' ? 0.5 : 1,
        endButtonDisabled: true,
        endButtonOpacity: 0.5,
        doLaterButtonDisabled: true,
        doLaterButtonOpacity: 0.5,
      };
    };

    const buttonStates = getButtonStates();

    return (
      <View
        style={[
          styles.userInfoContainer,
          {
            backgroundColor:
              item?.status == 'approved'
                ? Colors.lightgreen
                : item?.status == 'pending'
                ? Colors.lightred
                : item?.status == 'ongoing'
                ? Colors.lightYellow
                : item?.status == 'complete'
                ? Colors.lightgreen
                : Colors.lightred,
          },
        ]}
      >
        <View style={styles.userTextContainer}>
          <Text style={styles.blackText}>
            Visit Location :{' '}
            <Text style={styles.redText}>
              {item?.task_name ? item?.task_name : ''}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Visit Purpose :{' '}
            <Text style={styles.redText}>
              {item?.task_title ? item?.task_title : ''}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Start Date :{' '}
            <Text style={styles.redText}>
              {moment(item?.createTaskDate).format('ddd, MMM D, YYYY')},
              {item?.start_time}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            End Date :{' '}
            <Text style={styles.redText}>
              {moment(item?.endTaskDate).format('ddd, MMM D, YYYY')},
              {item?.end_time}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Status :{' '}
            <Text
              style={[
                styles.redText,
                {
                  color: item?.status == 'rejected' ? Colors.red : Colors.green,
                  textTransform: 'capitalize',
                },
              ]}
            >
              {item?.latest_tracking_status || 'Approved'}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Day :{' '}
            <Text
              style={[
                styles.redText,
                {
                  color:
                    item?.latest_tracking_status === 'ongoing'
                      ? Colors.red
                      : Colors.black,
                  textTransform: 'capitalize',
                },
              ]}
            >
              {item?.task_activity}
            </Text>
          </Text>

          {/* Display task tracking history */}
          {item?.task_tracking && item.task_tracking.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.blackText, { fontWeight: 'bold' }]}>
                Tracking History:
              </Text>
              {item.task_tracking.map((tracking, trackingIndex) => (
                <Text
                  key={trackingIndex}
                  style={[styles.blackText, { fontSize: 12, marginLeft: 10 }]}
                >
                  • {moment(tracking.created_at).format('MMM D, YYYY')} -{' '}
                  {tracking.status.toUpperCase()} - Start: {tracking.start_time}
                  {tracking.end_time
                    ? ` | End: ${tracking.end_time} | Duration: ${tracking.task_duration}`
                    : ' (In Progress)'}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Show buttons only if showButtons condition is met (shouldShowButtons is true AND today's task is not ended) */}
        {showButtons && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              {/* Start Task Button */}
              <Button
                height={normalize(45)}
                width={'48%'}
                marginTop={normalize(25)}
                backgroundColor={Colors.green}
                title={'Start Task'}
                fontSize={normalize(15)}
                fontFamily={Fonts.MulishSemiBold}
                textColor={'white'}
                opacity={buttonStates.startButtonOpacity}
                disabled={buttonStates.startButtonDisabled}
                onPress={() => {
                  if (
                    ProfileReducer?.attendenceStatusResponse
                      ?.is_attendance_given != 0
                  ) {
                    getLocation(item?.task_submit_id, 'start');
                  } else {
                    Alert.alert('Please Clock in first to start your day');
                  }
                }}
              />

              {/* End Task Button */}
              <Button
                height={normalize(45)}
                marginTop={normalize(25)}
                width={'48%'}
                backgroundColor={Colors.red}
                title={'End Task'}
                fontSize={normalize(15)}
                fontFamily={Fonts.MulishSemiBold}
                textColor={'white'}
                opacity={buttonStates.endButtonOpacity}
                disabled={buttonStates.endButtonDisabled}
                onPress={() => {
                  // Get the current ongoing task tracking ID
                  const ongoingTracking = item?.task_tracking?.find(
                    tracking => tracking.status === 'ongoing',
                  );

                  setTaskSubmitId(item?.task_submit_id);
                  setTaskTrackingId(
                    ongoingTracking?.task_tracking_id || item?.task_tracking_id,
                  );
                  setTaskAction('end');
                  setEndTaskModal(true);
                }}
              />
            </View>

            {/* Do it later Button */}
            <Button
              height={normalize(45)}
              width={'100%'}
              marginTop={normalize(5)}
              backgroundColor={Colors.skyblue}
              title={'Do it later'}
              fontSize={normalize(15)}
              fontFamily={Fonts.MulishSemiBold}
              textColor={'white'}
              opacity={buttonStates.doLaterButtonOpacity}
              disabled={buttonStates.doLaterButtonDisabled}
              onPress={() => {
                // Get the current ongoing task tracking ID
                const ongoingTracking = item?.task_tracking?.find(
                  tracking => tracking.status === 'ongoing',
                );

                setTaskSubmitId(item?.task_submit_id);
                setTaskTrackingId(
                  ongoingTracking?.task_tracking_id || item?.task_tracking_id,
                );

                Alert.alert('Are you sure', 'You want to do this later ?', [
                  {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      onDoTaskLater(
                        item?.task_submit_id,
                        ongoingTracking?.task_tracking_id ||
                          item?.task_tracking_id,
                      );
                    },
                  },
                ]);
              }}
            />
          </>
        )}
      </View>
    );
  };

  useEffect(() => {
    if (ProfileReducer?.taskLocationResponse?.length > 0) {
      let filteredLocations = ProfileReducer.taskLocationResponse;

      // Filter for high priority locations if attendance status is "Clocked In Other"
      if (
        ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
        'Clocked In Other'
      ) {
        filteredLocations = ProfileReducer.taskLocationResponse.filter(
          location => location.priority === 'high',
        );
      }

      setTaskLocation(filteredLocations);
    }
  }, [
    ProfileReducer.taskLocationResponse,
    ProfileReducer.attendenceStatusResponse,
  ]);

  useEffect(() => {
    if (ProfileReducer?.taskListResponse?.length > 0) {
      setTaskPurposeList(ProfileReducer.taskListResponse);
    }
  }, [ProfileReducer.taskListResponse]);

  useEffect(() => {
    if (ProfileReducer?.complitedTaskResponse?.length > 0) {
      setComplitedTaskData(ProfileReducer.complitedTaskResponse);
      dispatch(attendenceStatusRequest());
    }
  }, [ProfileReducer.complitedTaskResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/taskLocationRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/taskLocationSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskLocationFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/taskListRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/taskListSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskListFailure':
        status = ProfileReducer.status;
        showErrorAlert('Something went wrong!');
        break;
      case 'Profile/complitedTaskListRequest':
        status = ProfileReducer.status;

        setComplitedTaskData([]);
        break;
      case 'Profile/complitedTaskListSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/complitedTaskListFailure':
        status = ProfileReducer.status;
        showErrorAlert('Something went wrong! ');
        break;
      case 'Profile/addTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/addTaskSuccess':
        status = ProfileReducer.status;

        setLoading(false);
        setAddTaskModal(false);

        // Reset form fields
        setSelectedTasklocatio('');
        setSelectedTaskPurpose('');
        setOther_location('');
        setOther_purpose('');
        setStartDate(new Date());
        setEndDate(new Date());
        setStartTime(new Date());
        setEndTime(new Date());
        dispatch(complitedTaskListRequest(`approved,ongoing,complete`));
        dispatch(attendenceStatusRequest());

        break;
      case 'Profile/addTaskFailure':
        status = ProfileReducer.status;
        setLoading(false);
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;
      case 'Profile/startTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/startTaskSuccess':
        status = ProfileReducer.status;

        dispatch(complitedTaskListRequest(`approved,ongoing,complete`));
        dispatch(attendenceStatusRequest());

        break;
      case 'Profile/startTaskFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;
      case 'Profile/endTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/endTaskSuccess':
        status = ProfileReducer.status;

        dispatch(complitedTaskListRequest(`approved,ongoing,complete`));
        dispatch(attendenceStatusRequest());

        break;
      case 'Profile/endTaskFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;

      case 'Profile/taskDoItLaterRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/taskDoItLaterSuccess':
        status = ProfileReducer.status;
        dispatch(complitedTaskListRequest(`approved,ongoing,complete`));
        dispatch(attendenceStatusRequest());
        break;
      case 'Profile/taskDoItLaterFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;
    }
  }

  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'My Daily Task'}
        onPress_back_button={() => navigation.goBack()}
      />

      <Loader
        visible={
          // loader ||
          ProfileReducer?.status == 'Profile/taskLocationRequest' ||
          ProfileReducer?.status == 'Profile/taskListRequest' ||
          ProfileReducer?.status == 'Profile/complitedTaskListRequest' ||
          ProfileReducer?.status == 'Profile/addTaskRequest'
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={complitedTaskData}
          keyExtractor={item => item.id}
          renderItem={renderTaskList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </ScrollView>
      
      <TouchableOpacity
        style={{
          backgroundColor: Colors.skyblue,
          position: 'absolute',
          borderRadius: 100,
          padding: normalize(15),
          right: 20,
          bottom: 150,
          borderWidth: 1,
        }}
        onPress={() => {
          if (
            (ProfileReducer?.attendenceStatusResponse
              ?.attendance_status_text === 'Clocked In Other' &&
              ProfileReducer?.attendenceStatusResponse?.status === 'pending') ||
            ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 0
          ) {
            Alert.alert(
              'You are not allowed to add daily task.',
              ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 0
                ? 'Please Clock in first'
                : 'Please ask for Approval',
            );
          } else if (
            ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
              'Clocked Out Outside' ||
            ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
              'Clocked Out Inside' ||
            ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
              'Clocked Out Other' ||
            ProfileReducer?.attendenceStatusResponse?.is_attendence_allowed ===
              false
          ) {
            Alert.alert(
              'You are not allowed to add daily task.',
              'You already clocked Out',
            );
          } else {
            setAddTaskModal(true);
          }
        }}
      >
        <Image
          resizeMode="contain"
          source={Images.addTask}
          style={{
            width: normalize(20),
            height: normalize(20),
            tintColor: Colors.white,
          }}
        />
      </TouchableOpacity>

      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating={true}
        isVisible={endTaskModal}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setEndTaskModal(false)}
      >
        <ImageBackground
          resizeMode="stretch"
          // source={Images.pageBackground}
          style={[styles.modalContainer, { backgroundColor: Colors.bgColor }]}
        >
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setEndTaskModal(false);
            }}
          >
            <Image
              resizeMode="contain"
              source={Images.close}
              style={{ height: normalize(10), width: normalize(10) }}
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.modalScrollContent,
              { paddingTop: 70 },
            ]}
          >
            <Image
              resizeMode="contain"
              style={{
                alignSelf: 'center',
                height: normalize(50),
                width: normalize(50),
                marginTop: -50,
              }}
              source={Images.app_logo}
            />

            <Text
              style={{
                textAlign: 'center',
                fontFamily: Fonts.MulishExtraBold,
                fontSize: 22,
                color: Colors.white,
                marginBottom: normalize(15),
                marginTop: normalize(20),
              }}
            >
              About to end task...
            </Text>

            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: '#ff7973',
                },
              ]}
              onPress={() => {
                getLocation('inside', 'end_task');
              }}
            >
              <Text style={[styles.clockButtonText]}>End this task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.skyblue,
                },
              ]}
              onPress={() => {
                getLocation('inside', 'return_office');
              }}
            >
              <Text style={styles.clockButtonText}>Returned to office</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.red,
                },
              ]}
              onPress={() => {
                getLocation('inside', 'end_day');
              }}
            >
              <Text style={styles.clockButtonText}>End day</Text>
            </TouchableOpacity> */}
          </ScrollView>
        </ImageBackground>
      </Modal>

      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating={true}
        isVisible={addTaskModal}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setAddTaskModal(false)}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Images.drawerbg}
          style={styles.modalContainer}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                setAddTaskModal(false);
              }}
            >
              <Image
                resizeMode="contain"
                source={Images.close}
                style={{ height: normalize(10), width: normalize(10) }}
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add New Task</Text>

            <Text style={styles.fieldLabel}>
              Describe where are you visiting
            </Text>
            <View style={styles.dropdownContainer}>
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(100)}
                inputWidth={'100%'}
                marginTop={normalize(2)}
                backgroundColor={Colors.white}
                textColor={Colors.textInputColor}
                InputHeaderText={'Describe'}
                placeholder={'Describe'}
                inputheight={normalize(95)}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(25)}
                borderColor={Colors.skyblue}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={other_location}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                multiline
                onChangeText={e => setOther_location(e)}
                tintColor={Colors.tintGrey}
              />
            </View>

            <Text style={styles.fieldLabel}>Select visit purpose</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={[
                  styles.dropdown,
                  isFocusTask2 && { borderColor: '#24bcf7' },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                containerStyle={styles.dropdownListContainer}
                itemTextStyle={styles.dropdownItemText}
                data={TaskPurposeList}
                maxHeight={300}
                labelField="title"
                valueField="id"
                placeholder={!isFocusTask2 ? 'Select purpose' : '...'}
                searchPlaceholder="Search..."
                value={selectedTaskPurpose?.id}
                onFocus={() => setIsFocusTask2(true)}
                onBlur={() => setIsFocusTask2(false)}
                onChange={handleTaskPurposeSelect}
                renderLeftIcon={() => <Text style={styles.icon}>📋</Text>}
              />
              {selectedTaskPurpose?.title == 'Others' && (
                <TextInputWithButton
                  show={true}
                  icon={true}
                  height={normalize(45)}
                  inputWidth={'100%'}
                  backgroundColor={Colors.white}
                  marginTop={normalize(25)}
                  textColor={Colors.textInputColor}
                  InputHeaderText={'Other purpose'}
                  placeholder={'Other purpose'}
                  placeholderTextColor={Colors.black}
                  paddingLeft={normalize(25)}
                  borderColor={Colors.skyblue}
                  borderRadius={normalize(5)}
                  editable={true}
                  fontFamily={Fonts.MulishRegular}
                  isheadertext={true}
                  value={other_purpose}
                  fontSize={normalize(14)}
                  headertxtsize={normalize(13)}
                  onChangeText={e => setOther_purpose(e)}
                  tintColor={Colors.tintGrey}
                />
              )}
            </View>

            {/* Start Date and Time Section */}
            <Text style={styles.fieldLabel}>Start Date *</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  📅 {moment(startDate).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  🕐 {moment(startTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Date and Time Section */}
            <Text style={styles.fieldLabel}>End Date *</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  📅 {moment(endDate).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  🕐 {moment(endTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.orange,
                },
              ]}
              onPress={() => {
                getLocation();
              }}
            >
              <Text style={styles.clockButtonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </Modal>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onStartDateChange}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onEndDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          testID="startTimePicker"
          value={startTime}
          mode="time"
          // is24Hour={true}
          display="default"
          onChange={onStartTimeChange}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          testID="endTimePicker"
          value={endTime}
          mode="time"
          // is24Hour={true}
          display="default"
          onChange={onEndTimeChange}
        />
      )}
    </View>
  );
};

export default AttendenceReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bgColor,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 50,
    padding: 5,
    height: normalize(20),
    width: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalContainer: {
    maxHeight: '90%',
    justifyContent: 'center',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: normalize(20),
    paddingTop: normalize(40),
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 24,
    color: Colors.white,
    marginBottom: normalize(30),
  },
  fieldLabel: {
    textAlign: 'left',
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#34495e',
  },
  scrollViewContent: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(10),
    paddingBottom: normalize(100),
  },
  userInfoContainer: {
    width: '100%',
    padding: normalize(10),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    marginBottom: normalize(10),
  },
  userTextContainer: {
    width: '100%',
  },
  userName: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 20,
  },
  newTask: {
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    color: Colors.black,
    marginTop: normalize(5),
  },
  userAddress: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  blackText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    color: Colors.black,
  },
  redText: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 16,
    marginTop: 5,
    color: Colors.black,
  },
  todayText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    color: Colors.green,
  },
  imageContainer: {
    borderWidth: normalize(2),
    borderRadius: normalize(15),
    borderColor: Colors.skyblue,
    height: normalize(100),
    width: normalize(80),
    overflow: 'hidden',
  },
  userImage: {
    height: normalize(150),
    width: normalize(110),
  },
  userImagePlaceholder: {
    alignSelf: 'center',
    height: normalize(100),
    width: normalize(80),
  },
  mapSection: {
    width: '100%',
    padding: normalize(5),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    marginBottom: normalize(15),
  },
  mapContainer: {
    height: normalize(300),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    height: normalize(300),
    width: '100%',
  },
  clockButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(50),
    borderRadius: normalize(8),
    marginBottom: normalize(20),
    marginTop: normalize(20),
  },
  clockButtonText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
  },
  dropdownContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
  placeholderStyle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishRegular,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishSemiBold,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishRegular,
  },
  iconStyle: {
    width: 20,
    height: 20,
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
  // New styles for date/time pickers
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.white,
    borderColor: '#2494ea',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishSemiBold,
    textAlign: 'left',
  },
});
