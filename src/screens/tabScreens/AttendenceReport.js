import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import normalize from '../../utils/helpers/normalize';
import Modal from 'react-native-modal';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  attendenceReportRequest,
  attendenceStatusRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { useIsFocused } from '@react-navigation/native';

let status = '';

const AttendenceReport = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [attendenceList, setAttendenceList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format('YYYY-MM'),
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState(null);
console.log("ActivityData::::>>",activityData);

  const onPressDate = date => {
    connectionrequest()
      .then(() => {
        dispatch(attendenceStatusRequest(date));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };

  const generateMonthOptions = () => {
    const currentYear = moment().year();
    const currentMonth = moment().month();
    const months = [];
    for (let i = 0; i <= currentMonth; i++) {
      months.push({
        value: moment().year(currentYear).month(i).format('YYYY-MM'),
        label: moment().year(currentYear).month(i).format('MMMM YYYY'),
      });
    }
    return months.reverse();
  };

  const monthOptions = generateMonthOptions();

  const formatTime = time =>
    time ? moment(time, 'HH:mm:ss').format('hh:mm A') : 'Not recorded';

  const formatCalendarDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'present':  return Colors.lightgreen  || '#E8F5E8';
      case 'leave':    return Colors.lightred     || '#FFE8E8';
      case 'holiday':  return Colors.lightYellow  || '#FFF8E1';
      case 'pending':  return Colors.lightBlue    || '#E3F2FD';
      default:         return '#F5F5F5'; // absent
    }
  };

  const getStatusBadgeColor = status => {
    switch (status) {
      case 'present':  return '#4CAF50';
      case 'leave':    return '#F44336';
      case 'holiday':  return '#FF9800';
      case 'pending':  return '#2196F3';
      default:         return '#9E9E9E'; // absent
    }
  };
const getStatusLabel = rawStatus => {
  switch (rawStatus) {
    case 'clocked_in':  return 'Clocked In';
    case 'clocked_out': return 'Clocked Out';
    case 'present':     return 'Present';
    case 'absent':      return 'Absent';
    case 'leave':       return 'On Leave';
    case 'holiday':     return 'Holiday';
    default:            return rawStatus
        ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
        : 'Unknown';
  }
};

const getStatusPillStyle = rawStatus => {
  switch (rawStatus) {
    case 'clocked_in':
    case 'present':
      return { bg: '#E1F5EE', text: '#0F6E56' };
    case 'clocked_out':
      return { bg: '#E3F2FD', text: '#185FA5' };
    case 'leave':
      return { bg: '#FAECE7', text: '#993C1D' };
    case 'holiday':
      return { bg: '#FFF8E1', text: '#854F0B' };
    default:
      return { bg: '#F1EFE8', text: '#5F5E5A' };
  }
};
  const prepareSummaryData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) return null;
    const monthKey = Object.keys(attendenceList)[0];
    return attendenceList[monthKey]?.summary;
  };

  // ✅ Updated: now reads { status, description } objects from API
  const prepareCalendarData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) return [];
    const monthKey = Object.keys(attendenceList)[0];
    const calendarData = attendenceList[monthKey]?.calendar;
    if (!calendarData) return [];

    return Object.keys(calendarData)
      .sort()
      .map(date => {
        const entry = calendarData[date];
        // Support both old string format and new object format
        const statusValue =
          typeof entry === 'object' ? entry.status : entry;
        const description =
          typeof entry === 'object' ? entry.description : '';

        return {
          id: date,
          date,
          formattedDate: formatCalendarDate(date),
          status: statusValue,
          description,
          backgroundColor: getStatusColor(statusValue),
          badgeColor: getStatusBadgeColor(statusValue),
        };
      });
  };

  const renderSummaryCard = (title, value, icon, color) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryCardTitle}>{title}</Text>
        <Text style={[styles.summaryCardValue, { color }]}>{value}</Text>
      </View>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        <Text style={[styles.summaryIconText, { color }]}>{icon}</Text>
      </View>
    </View>
  );

  const renderSummarySection = () => {
    const summary = prepareSummaryData();
    if (!summary) return null;
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryGrid}>
          {renderSummaryCard('Present Days',   summary.total_present_days,                      '✓',  '#4CAF50')}
          {renderSummaryCard('Leave Days',     summary.total_leave_days,                        '✗',  '#F44336')}
          {renderSummaryCard('Absent Days',    summary.total_absent_days,                       '○',  '#FF9800')}
          {renderSummaryCard('Working Hours',  `${summary.total_working_hours}h`,               '⏱',  '#9C27B0')}
        </View>
        {/* Expected vs Actual hours progress */}
        <View style={styles.hoursProgressContainer}>
          <View style={styles.hoursProgressHeader}>
            <Text style={styles.hoursProgressLabel}>Working Hours Progress</Text>
            <Text style={styles.hoursProgressValue}>
              {summary.total_working_hours}h / {summary.expected_working_hours}h
            </Text>
          </View>
          <View style={styles.hoursProgressTrack}>
            <View
              style={[
                styles.hoursProgressFill,
                {
                  width: `${Math.min(
                    (parseFloat(summary.total_working_hours) /
                      parseFloat(summary.expected_working_hours)) *
                      100,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderMonthSelector = () => (
    <View style={styles.monthSelectorContainer}>
      <TouchableOpacity
        style={styles.monthSelectorButton}
        onPress={() => setShowMonthPicker(true)}
      >
        <Text style={styles.monthSelectorText}>
          {moment(selectedMonth).format('MMMM YYYY')}
        </Text>
        <Text style={styles.monthSelectorArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMonthPicker = () => (
    <Modal
      isVisible={showMonthPicker}
      onBackdropPress={() => setShowMonthPicker(false)}
      style={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Month</Text>
        <FlatList
          data={monthOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthOption,
                selectedMonth === item.value && styles.selectedMonthOption,
              ]}
              onPress={() => {
                setSelectedMonth(item.value);
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.monthOptionText,
                  selectedMonth === item.value && styles.selectedMonthOptionText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setShowMonthPicker(false)}
        >
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

const renderActivityModal = () => {
  if (!activityData) return null;

  const pillStyle = getStatusPillStyle(activityData?.status);
  const employeeName = ProfileReducer?.userDetailsResponse?.first_name + ' ' + ProfileReducer?.userDetailsResponse?.last_name || '';
  const initials = employeeName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const checkInTime  = activityData?.check_in
    ? moment(activityData.check_in).format('hh:mm A')
    : 'Not recorded';
  const checkOutTime = activityData?.check_out
    ? moment(activityData.check_out).format('hh:mm A')
    : null;
  const checkInPhoto  = activityData?.check_in_picture  || null;
  const checkOutPhoto = activityData?.check_out_picture || null;
  const workingMins   = activityData?.working_minutes   || 0;
  const workingHours  = Math.floor(workingMins / 60);
  const workingRem    = workingMins % 60;
  const workingLabel  =
    workingMins > 0
      ? `${workingHours}h ${workingRem}m`
      : 'In progress';

  const formattedDate = activityData?.date
    ? moment(activityData.date).format('dddd, MMM D YYYY')
    : '';

  return (
    <Modal
      isVisible={showActivityModal}
      onBackdropPress={() => setShowActivityModal(false)}
      style={styles.modalContainer}
    >
      <View style={styles.compactModalCard}>

        {/* ── Header ── */}
        <View style={styles.compactModalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.compactModalDate}>{formattedDate}</Text>
            <Text style={styles.compactModalTitle}>Daily Activity</Text>
          </View>
          <View style={styles.compactHeaderRight}>
            <View style={[styles.statusPill, { backgroundColor: pillStyle.bg }]}>
              <Text style={[styles.statusPillText, { color: pillStyle.text }]}>
                {getStatusLabel(activityData?.status)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.compactCloseBtn}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={styles.compactCloseBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>

          {/* ── Employee row ── */}
          <View style={styles.compactEmployeeRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.compactEmployeeName}>{employeeName}</Text>
              <Text style={styles.compactEmployeeRole}>Employee</Text>
            </View>
          </View>

          {/* ── Check-in / Check-out cards ── */}
          <View style={styles.timeCardRow}>
            <View style={[styles.timeCard, { opacity: 1 }]}>
              <Text style={styles.timeCardLabel}>Check in</Text>
              <Text style={styles.timeCardValue}>{checkInTime}</Text>
              <Text style={styles.timeCardSub}>
                {activityData?.is_attendance_given ? 'Recorded' : 'Not recorded'}
              </Text>
            </View>
            <View style={[styles.timeCard, { opacity: checkOutTime ? 1 : 0.5 }]}>
              <Text style={styles.timeCardLabel}>Check out</Text>
              <Text style={styles.timeCardValue}>{checkOutTime ?? '—'}</Text>
              <Text style={styles.timeCardSub}>
                {checkOutTime ? 'Recorded' : 'Not yet'}
              </Text>
            </View>
          </View>

          {/* ── Check-in Photo ── */}
          {checkInPhoto && (
            <View style={styles.photoSection}>
              <Text style={styles.photoSectionLabel}>Check-in photo</Text>
              <Image
                source={{ uri: checkInPhoto }}
                style={styles.compactPhoto}
                resizeMode="cover"
              />
            </View>
          )}

          {/* ── Check-out Photo ── */}
          {checkOutPhoto && (
            <View style={styles.photoSection}>
              <Text style={styles.photoSectionLabel}>Check-out photo</Text>
              <Image
                source={{ uri: checkOutPhoto }}
                style={styles.compactPhoto}
                resizeMode="cover"
              />
            </View>
          )}

          {/* ── Footer bar ── */}
          <View style={styles.compactFooter}>
            <Text style={styles.compactFooterText}>
              Working hours:{' '}
              <Text style={styles.compactFooterValue}>{workingLabel}</Text>
            </Text>
            <TouchableOpacity
              style={styles.compactFooterBtn}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={styles.compactFooterBtnText}>Close</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
};
  // ✅ Updated: shows description below date for holidays
  const renderCalendarItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tableRow, { backgroundColor: item.backgroundColor }]}
      onPress={() => onPressDate(item?.id)}
    >
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{item.formattedDate}</Text>
        {item.description ? (
          <Text style={styles.descriptionText}>{item.description}</Text>
        ) : null}
      </View>
      <View style={styles.statusColumn}>
        <View style={[styles.statusBadge, { backgroundColor: item.badgeColor }]}>
          <Text style={styles.statusText}>
            {item?.status?.charAt(0)?.toUpperCase() + item?.status?.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.dateColumn}>
        <Text style={styles.headerText}>Date</Text>
      </View>
      <View style={styles.statusColumn}>
        <Text style={styles.headerText}>Status</Text>
      </View>
    </View>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Status Legend</Text>
      <View style={styles.legendRow}>
        {[
          { color: '#4CAF50', label: 'Present' },
          { color: '#F44336', label: 'Leave' },
          { color: '#FF9800', label: 'Holiday' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        {[
          { color: '#2196F3', label: 'Pending' },
          { color: '#9E9E9E', label: 'Absent' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(attendenceReportRequest({ month: selectedMonth }));
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused, selectedMonth]);

  useEffect(() => {
    if (ProfileReducer?.attendenceReportResponse) {
      setAttendenceList(ProfileReducer?.attendenceReportResponse);
    }
  }, [ProfileReducer?.attendenceReportResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/attendenceReportRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceReportSuccess':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceReportFailure':
        status = ProfileReducer.status;
        break;

      case 'Profile/attendenceStatusRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceStatusSuccess':
        status = ProfileReducer.status;
        if (ProfileReducer?.attendenceStatusResponse) {
          setActivityData(ProfileReducer.attendenceStatusResponse);
          setShowActivityModal(true);
        }
        break;
      case 'Profile/attendenceStatusFailure':
        status = ProfileReducer.status;
        break;
    }
  }

  const calendarData = prepareCalendarData();
  const hasData = calendarData.length > 0 || prepareSummaryData() !== null;

  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendance Report'}
        onPress_back_button={() => navigation.goBack()}
      />
      <Loader visible={ProfileReducer?.status == 'Profile/attendenceReportRequest'} />

      <View style={styles.topRightContainer}>{renderMonthSelector()}</View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {hasData ? (
          <>
            {renderSummarySection()}
            <View style={styles.tableContainer}>
              <View style={styles.tableTopSection}>
                <Text style={styles.tableTitle}>Monthly Attendance</Text>
              </View>
              {calendarData.length > 0 ? (
                <>
                  {renderTableHeader()}
                  <FlatList
                    data={calendarData}
                    keyExtractor={item => item.id}
                    renderItem={renderCalendarItem}
                    style={styles.calendarFlatList}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />
                  {renderLegend()}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No attendance data available for this month
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noDataMainContainer}>
            <Text style={styles.noDataMainText}>
              No data available for selected month
            </Text>
            <Text style={styles.noDataSubText}>
              Please select a different month or check back later
            </Text>
          </View>
        )}
      </ScrollView>

      {renderMonthPicker()}
      {renderActivityModal()}
    </View>
  );
};

export default AttendenceReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
    marginBottom: 100,
  },

  // ── Summary ──
  summaryContainer: {
    backgroundColor: Colors.white,
    marginVertical: normalize(10),
    borderRadius: normalize(12),
    padding: normalize(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(12),
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCardContent: { flex: 1 },
  summaryCardTitle: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
    marginBottom: normalize(4),
  },
  summaryCardValue: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
  },
  summaryIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
  },
  hoursProgressContainer: {
    marginTop: normalize(4),
  },
  hoursProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(6),
  },
  hoursProgressLabel: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  hoursProgressValue: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: '#9C27B0',
  },
  hoursProgressTrack: {
    height: normalize(8),
    backgroundColor: '#f0f0f0',
    borderRadius: normalize(4),
    overflow: 'hidden',
  },
  hoursProgressFill: {
    height: '100%',
    backgroundColor: '#9C27B0',
    borderRadius: normalize(4),
  },

  // ── Table ──
  tableContainer: {
    backgroundColor: Colors.white,
    marginVertical: normalize(10),
    borderRadius: normalize(12),
    marginBottom: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tableTopSection: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  tableTitle: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray || '#f8f9fa',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  headerText: {
    fontSize: 14,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarFlatList: { flex: 1 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
    alignItems: 'center',
  },
  dateColumn: { flex: 1, justifyContent: 'center' },
  statusColumn: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  dateText: {
    fontSize: 14,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  descriptionText: {
    fontSize: 11,
    fontFamily: Fonts.MulishRegular,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
    textTransform: 'capitalize',
  },

  // ── Legend ──
  legendContainer: {
    padding: normalize(15),
    backgroundColor: Colors.lightGray || '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray || '#e9ecef',
    borderBottomLeftRadius: normalize(12),
    borderBottomRightRadius: normalize(12),
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(10),
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    marginRight: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  legendText: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },

  // ── Month Selector ──
  topRightContainer: { marginTop: normalize(10) },
  monthSelectorContainer: { alignItems: 'flex-end' },
  monthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: Colors.lightGray || '#e9ecef',
    minWidth: normalize(120),
  },
  monthSelectorText: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    flex: 1,
  },
  monthSelectorArrow: {
    fontSize: 10,
    color: Colors.black,
    marginLeft: normalize(4),
  },

  // ── Month Picker Modal ──
  modalContainer: { justifyContent: 'center', alignItems: 'center', margin: 0 },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    padding: normalize(20),
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  monthOption: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    marginBottom: normalize(8),
  },
  selectedMonthOption: { backgroundColor: Colors.lightBlue || '#e3f2fd' },
  monthOptionText: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  selectedMonthOptionText: { color: Colors.blue || '#2196F3' },
  modalCloseButton: {
    backgroundColor: Colors.blue || '#2196F3',
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    marginTop: normalize(16),
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
    textAlign: 'center',
  },

  // ── No Data ──
  noDataContainer: { padding: normalize(20), alignItems: 'center' },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },
  noDataMainContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginTop: 80,
    padding: 15,
    alignItems: 'center',
  },
  noDataMainText: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textAlign: 'center',
  },
  noDataSubText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },

  // ── Compact Activity Modal ──
  compactModalCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    width: '95%',
    maxHeight: '85%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  compactModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(12),
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  compactModalDate: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  compactModalTitle: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    marginTop: normalize(2),
  },
  compactHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  statusPill: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
    borderRadius: normalize(20),
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: Fonts.MulishBold,
  },
  compactCloseBtn: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#555555',        // ← darker bg so white text pops
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCloseBtnText: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,              // ← white ×
    lineHeight: normalize(22),
  },
  compactEmployeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  avatarCircle: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: Colors.lightBlue || '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontFamily: Fonts.MulishBold,
    color: Colors.blue || '#185FA5',
  },
  compactEmployeeName: {
    fontSize: 14,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  compactEmployeeRole: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  timeCardRow: {
    flexDirection: 'row',
    gap: normalize(8),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  timeCard: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#f8f9fa',
    borderRadius: normalize(10),
    padding: normalize(12),
  },
  timeCardLabel: {
    fontSize: 11,
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    marginBottom: normalize(4),
  },
  timeCardValue: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  timeCardSub: {
    fontSize: 11,
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    marginTop: normalize(3),
  },
  photoSection: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(4),
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  photoSectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.MulishBold,
    color: Colors.gray || '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalize(8),
  },
  compactPhoto: {
    width: '100%',
    height: normalize(150),
    borderRadius: normalize(10),
    marginBottom: normalize(10),
    backgroundColor: Colors.lightGray || '#f0f0f0',
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  compactFooterText: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  compactFooterValue: {
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  compactFooterBtn: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    backgroundColor: Colors.blue || '#2196F3',  // ← solid blue, matches month picker close
  },
  compactFooterBtnText: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.white,                         // ← white text on blue
  },
});