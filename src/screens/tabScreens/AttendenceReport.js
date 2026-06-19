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

// ─── Color tokens ────────────────────────────────────────────────────
const T = {
  present:  { strip: '#1D9E75', badge_bg: '#E1F5EE', badge_text: '#0F6E56', stat: '#0F6E56' },
  leave:    { strip: '#D85A30', badge_bg: '#FAECE7', badge_text: '#993C1D', stat: '#993C1D' },
  holiday:  { strip: '#EF9F27', badge_bg: '#FAEEDA', badge_text: '#854F0B', stat: '#854F0B' },
  absent:   { strip: '#B4B2A9', badge_bg: '#F1EFE8', badge_text: '#5F5E5A', stat: '#5F5E5A' },
  pending:  { strip: '#378ADD', badge_bg: '#E6F1FB', badge_text: '#185FA5', stat: '#185FA5' },
};

const getToken = status => T[status] || T.absent;

const BADGE_LABELS = {
  present:    'Present',
  leave:      'On leave',
  holiday:    'Holiday',
  absent:     'Absent',
  pending:    'Pending',
  clocked_in: 'Clocked in',
  clocked_out:'Clocked out',
};

let status = '';

const AttendenceReport = ({ navigation }) => {
  const dispatch    = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused   = useIsFocused();
  const [attendenceList, setAttendenceList]     = useState([]);
  const [selectedMonth, setSelectedMonth]       = useState(moment().format('YYYY-MM'));
  const [showMonthPicker, setShowMonthPicker]   = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData]         = useState(null);

  // ─── Network helpers ─────────────────────────────────────────────
  const onPressDate = date => {
    connectionrequest()
      .then(() => dispatch(attendenceStatusRequest(date)))
      .catch(() => showErrorAlert('Please connect to internet'));
  };

  // ─── Month options (current year, up to today) ───────────────────
  const generateMonthOptions = () => {
    const months = [];
    for (let i = 0; i <= moment().month(); i++) {
      months.push({
        value: moment().month(i).format('YYYY-MM'),
        label: moment().month(i).format('MMMM YYYY'),
      });
    }
    return months.reverse();
  };
  const monthOptions = generateMonthOptions();

  // ─── Data preparation ─────────────────────────────────────────────
  const prepareSummaryData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) return null;
    return attendenceList[Object.keys(attendenceList)[0]]?.summary;
  };

  const prepareCalendarData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) return [];
    const calendarData = attendenceList[Object.keys(attendenceList)[0]]?.calendar;
    if (!calendarData) return [];
    return Object.keys(calendarData)
      .sort()
      .map(date => {
        const entry       = calendarData[date];
        const statusValue = typeof entry === 'object' ? entry.status : entry;
        const description = typeof entry === 'object' ? entry.description : '';
        const tok         = getToken(statusValue);
        return { id: date, date, statusValue, description, tok };
      });
  };

  // ─── Formatted helpers ────────────────────────────────────────────
  const fmtTime = raw =>
    raw ? moment(raw).format('hh:mm A') : '—';

  const workingLabel = mins => {
    if (!mins || mins <= 0) return 'In progress';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  // ─── Renderers ───────────────────────────────────────────────────

  /** Top month selector pill */
  const renderMonthSelector = () => (
    <TouchableOpacity
      style={styles.monthPill}
      onPress={() => setShowMonthPicker(true)}
    >
      <Text style={styles.monthPillText}>
        {moment(selectedMonth).format('MMMM YYYY')}
      </Text>
      <Text style={styles.monthPillArrow}>▼</Text>
    </TouchableOpacity>
  );

  /** Compact 2×2 stat inside the summary card */
  const renderStatCell = (icon, value, label, statColor, shade) => (
    <View style={[styles.statCell, { backgroundColor: shade }]}>
      <Text style={[styles.statIcon, { color: statColor }]}>{icon}</Text>
      <Text style={[styles.statValue, { color: statColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  /** Monthly summary card */
  const renderSummarySection = () => {
    const s = prepareSummaryData();
    if (!s) return null;
    const totalH    = parseFloat(s.total_working_hours)   || 0;
    const expectedH = parseFloat(s.expected_working_hours) || 1;
    const pct       = Math.min((totalH / expectedH) * 100, 100);
    return (
      <View style={styles.summaryCard}>
        {/* Card header */}
        <View style={styles.summaryCardHeader}>
          <View>
            <Text style={styles.overviewEyebrow}>Monthly overview</Text>
            <Text style={styles.overviewMonth}>
              {moment(selectedMonth).format('MMMM YYYY')}
            </Text>
          </View>
          <View style={styles.onTrackBadge}>
            <Text style={styles.onTrackText}>On track</Text>
          </View>
        </View>

        {/* 2×2 stats grid */}
        <View style={styles.statsGrid}>
          {renderStatCell('✓', s.total_present_days,  'Present days',   T.present.stat, '#fff')}
          {renderStatCell('✗', s.total_leave_days,    'Leave days',     T.leave.stat,   '#fff')}
          {renderStatCell('○', s.total_absent_days,   'Absent days',    T.holiday.stat, '#FAFAF8')}
          {renderStatCell('⏱', `${totalH}h`,          'Working hours',  '#534AB7',      '#FAFAF8')}
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Hours progress</Text>
            <Text style={styles.progressValue}>{totalH}h / {expectedH}h</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
    );
  };

  /** Single day row card */
  const renderCalendarItem = ({ item }) => {
    const tok       = item.tok;
    const dateObj   = new Date(item.date);
    const dayNum    = dateObj.getDate().toString().padStart(2, '0');
    const dayName   = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDay   = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const label     = BADGE_LABELS[item.statusValue] ||
      (item.statusValue
        ? item.statusValue.charAt(0).toUpperCase() + item.statusValue.slice(1)
        : 'Unknown');

    return (
      <TouchableOpacity
        style={styles.dayCard}
        activeOpacity={0.7}
        onPress={() => onPressDate(item.id)}
      >
        {/* colored top strip */}
        <View style={[styles.dayStrip, { backgroundColor: tok.strip }]} />
        <View style={styles.dayRow}>
          {/* date block */}
          <View style={styles.dateBlock}>
            <Text style={styles.dateNum}>{dayNum}</Text>
            <Text style={styles.dateDay}>{dayName}</Text>
          </View>
          <View style={styles.dayDivider} />
          {/* info */}
          <View style={styles.dayInfo}>
            <Text style={styles.dayFullName}>{fullDay}</Text>
            {item.description ? (
              <Text style={styles.dayDesc}>{item.description}</Text>
            ) : null}
          </View>
          {/* badge */}
          <View style={[styles.statusBadge, { backgroundColor: tok.badge_bg }]}>
            <Text style={[styles.statusBadgeText, { color: tok.badge_text }]}>
              {label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /** Month picker modal */
  const renderMonthPicker = () => (
    <Modal
      isVisible={showMonthPicker}
      onBackdropPress={() => setShowMonthPicker(false)}
      style={styles.modalWrap}
    >
      <View style={styles.pickerSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.pickerTitle}>Select month</Text>
        <FlatList
          data={monthOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pickerOption,
                selectedMonth === item.value && styles.pickerOptionSelected,
              ]}
              onPress={() => {
                setSelectedMonth(item.value);
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  selectedMonth === item.value && styles.pickerOptionTextSelected,
                ]}
              >
                {item.label}
              </Text>
              {selectedMonth === item.value && (
                <Text style={styles.pickerCheck}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.pickerCloseBtn}
          onPress={() => setShowMonthPicker(false)}
        >
          <Text style={styles.pickerCloseBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  /** Activity bottom-sheet modal */
  const renderActivityModal = () => {
    if (!activityData) return null;
    const tok = getToken(activityData?.status);
    const label =
      BADGE_LABELS[activityData?.status] ||
      (activityData?.status
        ? activityData.status.charAt(0).toUpperCase() + activityData.status.slice(1)
        : 'Unknown');

    const firstName = ProfileReducer?.userDetailsResponse?.first_name || '';
    const lastName  = ProfileReducer?.userDetailsResponse?.last_name  || '';
    const fullName  = `${firstName} ${lastName}`.trim();
    const initials  = [firstName[0], lastName[0]]
      .filter(Boolean).join('').toUpperCase();

    const checkInTime  = fmtTime(activityData?.check_in);
    const checkOutTime = fmtTime(activityData?.check_out);
    const formattedDate = activityData?.date
      ? moment(activityData.date).format('dddd, MMM D YYYY')
      : '';

    return (
      <Modal
        isVisible={showActivityModal}
        onBackdropPress={() => setShowActivityModal(false)}
        style={styles.modalWrap}
        swipeDirection="down"
        onSwipeComplete={() => setShowActivityModal(false)}
      >
        <View style={styles.activitySheet}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.activityHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityDate}>{formattedDate}</Text>
              <Text style={styles.activityTitle}>Daily activity</Text>
            </View>
            <View style={styles.activityHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: tok.badge_bg }]}>
                <Text style={[styles.statusBadgeText, { color: tok.badge_text }]}>
                  {label}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeIconBtn}
                onPress={() => setShowActivityModal(false)}
              >
                <Text style={styles.closeIconBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Employee row */}
          <View style={styles.empRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.empName}>{fullName}</Text>
              <Text style={styles.empRole}>Employee</Text>
            </View>
          </View>

          {/* Time cards */}
          <View style={styles.timeCardRow}>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardLabel}>Check in</Text>
              <Text style={styles.timeCardValue}>{checkInTime}</Text>
              <Text style={styles.timeCardSub}>
                {activityData?.is_attendance_given ? 'Recorded' : 'Not recorded'}
              </Text>
            </View>
            <View style={[styles.timeCard, !activityData?.check_out && styles.timeCardDim]}>
              <Text style={styles.timeCardLabel}>Check out</Text>
              <Text style={styles.timeCardValue}>{checkOutTime}</Text>
              <Text style={styles.timeCardSub}>
                {activityData?.check_out ? 'Recorded' : 'Not yet'}
              </Text>
            </View>
          </View>

          {/* Check-in photo */}
          {activityData?.check_in_picture ? (
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Check-in photo</Text>
              <Image
                source={{ uri: activityData.check_in_picture }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Check-out photo */}
          {activityData?.check_out_picture ? (
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Check-out photo</Text>
              <Image
                source={{ uri: activityData.check_out_picture }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.activityFooter}>
            <Text style={styles.activityFooterText}>
              Working hours:{' '}
              <Text style={styles.activityFooterVal}>
                {workingLabel(activityData?.working_minutes)}
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ─── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => dispatch(attendenceReportRequest({ month: selectedMonth })))
        .catch(() => showErrorAlert('Please connect to internet'));
    }
  }, [isFocused, selectedMonth]);

  useEffect(() => {
    if (ProfileReducer?.attendenceReportResponse) {
      setAttendenceList(ProfileReducer.attendenceReportResponse);
    }
  }, [ProfileReducer?.attendenceReportResponse]);

  if (status === '' || ProfileReducer.status !== status) {
    switch (ProfileReducer.status) {
      case 'Profile/attendenceReportRequest':
      case 'Profile/attendenceReportSuccess':
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

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendance'}
        onPress_back_button={() => navigation.goBack()}
      />
      <Loader
        visible={ProfileReducer?.status === 'Profile/attendenceReportRequest'}
      />

      {/* Month selector */}
      <View style={styles.monthRow}>{renderMonthSelector()}</View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasData ? (
          <>
            {renderSummarySection()}

            {calendarData.length > 0 && (
              <View style={styles.section}>
                {/* Section header */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily log</Text>
                  <View style={styles.legendRow}>
                    {[
                      { color: T.present.strip, label: 'Present' },
                      { color: T.leave.strip,   label: 'Leave'   },
                      { color: T.absent.strip,  label: 'Absent'  },
                    ].map(l => (
                      <View key={l.label} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                        <Text style={styles.legendText}>{l.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <FlatList
                  data={calendarData}
                  keyExtractor={item => item.id}
                  renderItem={renderCalendarItem}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: normalize(6) }} />}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No data for this month</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different month above
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
    backgroundColor: '#F2F3F7',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: normalize(14),
    paddingBottom: normalize(120),
    gap: normalize(12),
  },

  // ── Month selector ────────────────────────────────────────────────
  monthRow: {
    paddingHorizontal: normalize(14),
    paddingTop: normalize(10),
    alignItems: 'flex-end',
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    backgroundColor: '#E6F1FB',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
  },
  monthPillText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishSemiBold,
    color: '#185FA5',
  },
  monthPillArrow: { fontSize: normalize(10), color: '#185FA5' },

  // ── Summary card ─────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: normalize(14),
    paddingBottom: normalize(10),
  },
  overviewEyebrow: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalize(2),
  },
  overviewMonth: {
    fontSize: normalize(19),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  onTrackBadge: {
    backgroundColor: '#E1F5EE',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
  },
  onTrackText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishSemiBold,
    color: '#0F6E56',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },
  statCell: {
    width: '50%',
    padding: normalize(12),
    paddingLeft: normalize(14),
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  statIcon:  { fontSize: normalize(16), marginBottom: normalize(4) },
  statValue: { fontSize: normalize(22), fontFamily: Fonts.MulishBold },
  statLabel: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
    marginTop: normalize(1),
  },

  progressSection: {
    padding: normalize(12),
    paddingHorizontal: normalize(14),
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(6),
  },
  progressLabel: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  progressValue: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishSemiBold,
    color: '#534AB7',
  },
  progressTrack: {
    height: normalize(6),
    backgroundColor: '#ECECEC',
    borderRadius: normalize(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#534AB7',
    borderRadius: normalize(3),
  },

  // ── Section ───────────────────────────────────────────────────────
  section: { gap: normalize(8) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: normalize(14),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  legendRow:  { flexDirection: 'row', gap: normalize(10) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: normalize(4) },
  legendDot:  { width: normalize(7), height: normalize(7), borderRadius: normalize(4) },
  legendText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
  },

  // ── Day card ──────────────────────────────────────────────────────
  dayCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  dayStrip: { height: normalize(3) },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(11),
    paddingHorizontal: normalize(14),
    gap: normalize(12),
  },
  dateBlock: { width: normalize(34), alignItems: 'center' },
  dateNum: {
    fontSize: normalize(17),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    lineHeight: normalize(20),
  },
  dateDay: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    marginTop: normalize(1),
  },
  dayDivider: {
    width: 0.5,
    height: normalize(28),
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dayInfo: { flex: 1 },
  dayFullName: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  dayDesc: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    marginTop: normalize(1),
  },
  statusBadge: {
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
  },
  statusBadgeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishSemiBold,
  },

  // ── Month picker modal ────────────────────────────────────────────
  modalWrap: { justifyContent: 'flex-end', margin: 0 },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    padding: normalize(20),
    maxHeight: '70%',
  },
  sheetHandle: {
    width: normalize(36),
    height: normalize(4),
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: normalize(2),
    alignSelf: 'center',
    marginBottom: normalize(16),
  },
  pickerTitle: {
    fontSize: normalize(16),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(12),
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(8),
  },
  pickerOptionSelected: { backgroundColor: '#E6F1FB' },
  pickerOptionText: {
    fontSize: normalize(15),
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  pickerOptionTextSelected: { color: '#185FA5' },
  pickerCheck: { fontSize: normalize(14), color: '#185FA5' },
  pickerCloseBtn: {
    backgroundColor: '#185FA5',
    borderRadius: normalize(10),
    paddingVertical: normalize(12),
    marginTop: normalize(16),
    alignItems: 'center',
  },
  pickerCloseBtnText: {
    fontSize: normalize(15),
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
  },

  // ── Activity bottom sheet ─────────────────────────────────────────
  activitySheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    overflow: 'hidden',
    paddingTop: normalize(10),
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    paddingBottom: normalize(12),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  activityDate: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  activityTitle: {
    fontSize: normalize(16),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    marginTop: normalize(2),
  },
  activityHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  closeIconBtn: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconBtnText: {
    fontSize: normalize(20),
    color: Colors.black,
    lineHeight: normalize(24),
    fontFamily: Fonts.MulishBold,
  },

  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    padding: normalize(12),
    paddingHorizontal: normalize(16),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  avatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishBold,
    color: '#185FA5',
  },
  empName: {
    fontSize: normalize(14),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  empRole: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },

  timeCardRow: {
    flexDirection: 'row',
    gap: normalize(8),
    padding: normalize(12),
    paddingHorizontal: normalize(16),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: normalize(10),
    padding: normalize(12),
  },
  timeCardDim: { opacity: 0.5 },
  timeCardLabel: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeCardValue: {
    fontSize: normalize(17),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    marginTop: normalize(4),
    marginBottom: normalize(2),
  },
  timeCardSub: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
  },

  photoSection: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(4),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  photoLabel: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishBold,
    color: Colors.gray || '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalize(8),
  },
  photo: {
    width: '100%',
    height: normalize(150),
    borderRadius: normalize(10),
    marginBottom: normalize(12),
    backgroundColor: '#EBEBEB',
  },

  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(12),
    paddingHorizontal: normalize(16),
  },
  activityFooterText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },
  activityFooterVal: {
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  doneBtn: {
    backgroundColor: '#185FA5',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(7),
  },
  doneBtnText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.white,
  },

  // ── Empty state ───────────────────────────────────────────────────
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    padding: normalize(32),
    alignItems: 'center',
    marginTop: normalize(60),
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  emptyTitle: {
    fontSize: normalize(15),
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(6),
  },
  emptySubtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#888',
    textAlign: 'center',
  },
});