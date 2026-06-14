import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import DatePicker from 'react-native-date-picker';
import normalize from '../../utils/helpers/normalize';
import Modal from 'react-native-modal';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyLeaveRequest,
  holidayListRequest,
  leaveTypeRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { Dropdown } from 'react-native-element-dropdown';
import { useIsFocused } from '@react-navigation/native';
import constants from '../../utils/helpers/constants';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MessageModal from '../../components/MessageModal';

let status = '';

const PURPLE       = '#5B52F0';
const PURPLE_DARK  = '#4740D4';
const PURPLE_LIGHT = '#EBEBFF';
const PURPLE_MID   = '#C7C4FF';
const GREEN        = '#22A06B';
const GREEN_LIGHT  = '#E3F9EE';
const GREEN_BORDER = '#6BCB9A';
const BORDER       = '#B8C0CC';      // ← much darker default border
const BORDER_FOCUS = PURPLE;
const TEXT_DARK    = '#1A1F36';
const TEXT_MID     = '#4A5568';
const TEXT_MUTED   = '#8898AA';
const BG           = '#F0F2F8';
const CARD         = '#FFFFFF';

const ApplyLeave = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();

  const [startDate, setStartDate]               = useState(new Date());
  const [endDate, setEndDate]                   = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker]     = useState(false);
  const [leaveType, setLeaveType]               = useState([]);
  const [isFocusTask, setIsFocusTask]           = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState(null);
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState('');
  const [reason, setReason]                     = useState('');
  const [reasonFocused, setReasonFocused]       = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [isHolidayVisible, setIsHolidayVisible] = useState(false);
  const [holidays, setHolidays]                 = useState([]);
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showFileOptions, setShowFileOptions]   = useState(false);
  const [isHalfDay, setIsHalfDay]               = useState(false);
  const [halfDayPeriod, setHalfDayPeriod]       = useState('first');

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => { dispatch(leaveTypeRequest()); dispatch(holidayListRequest()); })
        .catch(() => showErrorAlert('Please connect to internet'));
    }
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.leaveTypeResponse?.length > 0) {
      setLeaveType(
        ProfileReducer.leaveTypeResponse.map(l => ({ ...l, formatted_label: l.name }))
      );
    }
  }, [ProfileReducer?.leaveTypeResponse]);

  useEffect(() => { if (isHalfDay) setEndDate(startDate); }, [isHalfDay]);

  /* ─── Dropdown item renderer ─────────────────────────────────────── */
  const renderDropdownItem = item => {
    const remaining = parseInt(item.remaining_leaves ?? item.max_days_per_year ?? 0);
    const total     = parseInt(item.max_days_per_year ?? 0);
    const isNo  = remaining === 0;
    const isLow = remaining <= 2 && !isNo;

    return (
      <View style={s.ddItem}>
        <View style={s.ddItemLeft}>
          <View style={[s.colorDot, { backgroundColor: item.color || PURPLE }]} />
          <Text style={s.ddItemName}>{item.name}</Text>
        </View>
        <View style={[s.badge, isNo ? s.badgeRed : isLow ? s.badgeOrange : s.badgeGreen]}>
          <Text style={[s.badgeTxt, isNo ? s.badgeRedTxt : isLow ? s.badgeOrangeTxt : s.badgeGreenTxt]}>
            {remaining}/{total}
          </Text>
        </View>
      </View>
    );
  };

  /* ─── Camera / gallery ────────────────────────────────────────────── */
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera Permission', message: 'App needs camera permission',
        buttonNeutral: 'Ask Me Later', buttonNegative: 'Cancel', buttonPositive: 'OK',
      });
      return g === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleCamera = async () => {
    if (!(await requestCameraPermission())) { showErrorAlert('Camera permission required'); return; }
    launchCamera({ mediaType: 'photo', quality: 0.7, maxWidth: 1000, maxHeight: 1000 }, res => {
      setShowFileOptions(false);
      if (!res.didCancel && !res.errorMessage && res.assets?.[0]) setSupportingDocument(res.assets[0]);
    });
  };

  const handleGallery = () => {
    launchImageLibrary({ mediaType: 'mixed', quality: 0.7, maxWidth: 1000, maxHeight: 1000 }, res => {
      setShowFileOptions(false);
      if (!res.didCancel && !res.errorMessage && res.assets?.[0]) setSupportingDocument(res.assets[0]);
    });
  };

  /* ─── Helpers ─────────────────────────────────────────────────────── */
  const formatDate    = d => moment(d).format('YYYY-MM-DD');
  const formatDisplay = d => moment(d).format('DD MMM YYYY');
  const formatDay     = d => moment(d).format('ddd');

  const leaveDays = () => {
    if (isHalfDay) return 0.5;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  };

  const handleStartDateConfirm = d => {
    setShowStartDatePicker(false);
    setStartDate(d);
    if (d > endDate) setEndDate(d);
    if (isHalfDay) setEndDate(d);
  };

  const handleEndDateConfirm = d => {
    setShowEndDatePicker(false);
    if (d >= startDate) setEndDate(d);
    else Alert.alert('Invalid Date', 'End date cannot be before start date');
  };

  /* ─── Submit ──────────────────────────────────────────────────────── */
  function handleSubmit() {
    if (!selectedLeaveTypeId) { showErrorAlert('Please select a leave type.'); return; }
    if (!reason.trim())       { showErrorAlert('Please add a reason for leave.'); return; }
    if ((selectedLeaveTypeId == 11 || selectedLeaveTypeId == 13) && !supportingDocument)
      { showErrorAlert('Please upload a supporting document.'); return; }

    const obj = {
      start_date:    formatDate(startDate),
      end_date:      formatDate(endDate),
      leave_type_id: selectedLeaveTypeId,
      reason,
      is_half_day:   isHalfDay ? 1 : 0,
    };

    connectionrequest()
      .then(() => dispatch(applyLeaveRequest(obj)))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

  /* ─── Redux status handler ────────────────────────────────────────── */
  if (status === '' || ProfileReducer.status !== status) {
    switch (ProfileReducer.status) {
      case 'Profile/applyLeaveRequest':  status = ProfileReducer.status; break;
      case 'Profile/applyLeaveSuccess':
        status = ProfileReducer.status;
        setStartDate(new Date()); setEndDate(new Date());
        setSelectedLeaveTypeId(null); setSelectedLeaveTypeName('');
        setReason(''); setSupportingDocument(null); setIsHalfDay(false);
        break;
      case 'Profile/applyLeaveFailure':  status = ProfileReducer.status; break;
      case 'Profile/holidayListRequest': status = ProfileReducer.status; break;
      case 'Profile/holidayListSuccess':
        status = ProfileReducer.status;
        setHolidays(ProfileReducer?.holidayListResponse);
        break;
      case 'Profile/holidayListFailure': status = ProfileReducer.status; break;
    }
  }

  const days = leaveDays();

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <Loader visible={
        ProfileReducer?.status === 'Profile/leaveTypeRequest' ||
        ProfileReducer?.status === 'Profile/applyLeaveRequest'
      } />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}>

        {/* ── Header bar ─────────────────────────────────── */}
        <View style={s.topBar}>
          <View>
            <Text style={s.screenTitle}>Apply Leave</Text>
            <Text style={s.screenSub}>Submit a new leave request</Text>
          </View>
          <TouchableOpacity style={s.holidayBtn} onPress={() => setIsHolidayVisible(true)}>
            <Text style={s.holidayBtnIcon}>🗓</Text>
            <Text style={s.holidayBtnText}>Holidays</Text>
          </TouchableOpacity>
        </View>

        {/* ── Duration card ──────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>LEAVE DURATION</Text>

          <View style={s.dateRow}>
            <TouchableOpacity style={s.datePillFrom} onPress={() => setShowStartDatePicker(true)}>
              <Text style={s.pillTag}>FROM</Text>
              <Text style={s.pillDay}>{formatDay(startDate)}</Text>
              <Text style={s.pillDate}>{formatDisplay(startDate)}</Text>
            </TouchableOpacity>

            <View style={s.pillMid}>
              <View style={s.arrowLine} />
              <View style={s.daysBubble}>
                <Text style={s.daysBubbleTxt}>{days}{days === 0.5 ? '½' : ''}</Text>
                <Text style={s.daysBubbleSub}>{days === 0.5 ? 'half' : days === 1 ? 'day' : 'days'}</Text>
              </View>
              <View style={s.arrowLine} />
            </View>

            <TouchableOpacity
              style={[s.datePillTo, isHalfDay && s.pillDisabled]}
              onPress={() => !isHalfDay && setShowEndDatePicker(true)}
              activeOpacity={isHalfDay ? 1 : 0.7}
            >
              <Text style={s.pillTag}>TO</Text>
              <Text style={s.pillDay}>{formatDay(endDate)}</Text>
              <Text style={s.pillDate}>{formatDisplay(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Half day toggle */}
          <View style={s.halfRow}>
            <Text style={s.halfIcon}>🌗</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.halfLabel}>Half Day</Text>
              <Text style={s.halfHint}>Single-day leaves only</Text>
            </View>
            <Switch
              value={isHalfDay}
              onValueChange={v => { setIsHalfDay(v); if (v) setHalfDayPeriod('first'); }}
              trackColor={{ false: '#D1D9E0', true: PURPLE_MID }}
              thumbColor={isHalfDay ? PURPLE : '#9AAAB8'}
            />
          </View>

          {isHalfDay && (
            <View style={s.periodRow}>
              {['first', 'second'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[s.periodBtn, halfDayPeriod === p && s.periodBtnOn]}
                  onPress={() => setHalfDayPeriod(p)}
                >
                  <Text style={[s.periodTxt, halfDayPeriod === p && s.periodTxtOn]}>
                    {p === 'first' ? '🌅 First Half' : '🌆 Second Half'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Leave type card ────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>LEAVE TYPE</Text>
          <Dropdown
            style={[s.dropdown, isFocusTask && s.dropdownFocused]}
            placeholderStyle={s.ddPlaceholder}
            selectedTextStyle={s.ddSelected}
            inputSearchStyle={s.ddSearch}
            iconStyle={s.ddIcon}
            containerStyle={s.ddContainer}
            data={leaveType}
            renderItem={renderDropdownItem}
            maxHeight={260}
            labelField="formatted_label"
            valueField="leave_type_id"
            placeholder="Select leave type"
            searchPlaceholder="Search…"
            value={selectedLeaveTypeId}
            onFocus={() => setIsFocusTask(true)}
            onBlur={() => setIsFocusTask(false)}
            onChange={item => {
              setSelectedLeaveTypeName(item.name);
              const remaining = parseInt(item.remaining_leaves ?? item.max_days_per_year ?? 0);
              if (remaining === 0) {
                setShowMessageModal(true);
              } else {
                setSelectedLeaveTypeId(item.id);
                setIsFocusTask(false);
              }
            }}
            renderLeftIcon={() => (
              <View style={[s.ddDot, {
                backgroundColor: leaveType.find(l => l.leave_type_id === selectedLeaveTypeId)?.color || PURPLE,
              }]} />
            )}
          />
        </View>

        {/* ── Reason card (native TextInput) ─────────────── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>REASON FOR LEAVE</Text>
          <TextInput
            style={[s.reasonInput, reasonFocused && s.reasonInputFocused]}
            placeholder="Briefly describe your reason…"
            placeholderTextColor={TEXT_MUTED}
            value={reason}
            onChangeText={setReason}
            onFocus={() => setReasonFocused(true)}
            onBlur={() => setReasonFocused(false)}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{reason.length}/500</Text>
        </View>

        {/* ── Supporting document card ───────────────────── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Text style={s.sectionLabel}>SUPPORTING DOCUMENT</Text>
            {!(selectedLeaveTypeId == 11 || selectedLeaveTypeId == 13) && (
              <View style={s.optBadge}><Text style={s.optBadgeTxt}>Optional</Text></View>
            )}
          </View>

          {supportingDocument ? (
            <View style={s.fileAttached}>
              <View style={s.fileIcon}><Text style={{ fontSize: 20 }}>🖼️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.fileName} numberOfLines={1}>
                  {supportingDocument.fileName || 'Selected photo'}
                </Text>
                {supportingDocument.fileSize && (
                  <Text style={s.fileSize}>
                    {(supportingDocument.fileSize / 1024).toFixed(1)} KB
                  </Text>
                )}
              </View>
              <TouchableOpacity style={s.removeBtn} onPress={() => setSupportingDocument(null)}>
                <Text style={s.removeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.uploadZone} onPress={() => setShowFileOptions(true)}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>📎</Text>
              <Text style={s.uploadTxt}>Attach a photo</Text>
              <Text style={s.uploadHint}>Camera or Gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Submit ────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.submitBtn, isSubmitting && s.submitBtnOff]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={s.submitTxt}>
            {isSubmitting ? 'Submitting…' : 'Submit Leave Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date pickers */}
      <DatePicker modal open={showStartDatePicker} date={startDate} mode="date"
        onConfirm={handleStartDateConfirm} onCancel={() => setShowStartDatePicker(false)}
        minimumDate={new Date()} title="Select Start Date" confirmText="Confirm" cancelText="Cancel" />
      <DatePicker modal open={showEndDatePicker} date={endDate} mode="date"
        onConfirm={handleEndDateConfirm} onCancel={() => setShowEndDatePicker(false)}
        minimumDate={startDate} title="Select End Date" confirmText="Confirm" cancelText="Cancel" />

      {/* No-leave modal */}
      <MessageModal
        isVisible={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        message={`You have no available ${selectedLeaveTypeName}`}
        okLabel="OK"
      />

      {/* File options bottom sheet */}
      <Modal animationIn="slideInUp" animationOut="slideOutDown"
        backdropTransitionOutTiming={0} backdropOpacity={0.45}
        hideModalContentWhileAnimating isVisible={showFileOptions}
        style={s.bsModal} onBackdropPress={() => setShowFileOptions(false)}>
        <View style={s.bs}>
          <View style={s.bsHandle} />
          <Text style={s.bsTitle}>Add Document</Text>
          {[
            { label: 'Take Photo',            sub: 'Use your camera',  icon: '📷', bg: PURPLE_LIGHT, fn: handleCamera  },
            { label: 'Choose from Gallery',   sub: 'Photos & files',   icon: '🖼️', bg: GREEN_LIGHT,  fn: handleGallery },
          ].map(opt => (
            <TouchableOpacity key={opt.label} style={s.sheetOpt} onPress={opt.fn}>
              <View style={[s.sheetOptIcon, { backgroundColor: opt.bg }]}>
                <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
              </View>
              <View>
                <Text style={s.sheetOptTitle}>{opt.label}</Text>
                <Text style={s.sheetOptSub}>{opt.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.sheetCancel} onPress={() => setShowFileOptions(false)}>
            <Text style={s.sheetCancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Holiday bottom sheet */}
      <Modal animationIn="slideInUp" animationOut="slideOutDown"
        backdropTransitionOutTiming={0} backdropOpacity={0.5}
        hideModalContentWhileAnimating isVisible={isHolidayVisible}
        style={s.bsModal} onBackdropPress={() => setIsHolidayVisible(false)}>
        <View style={[s.bs, { maxHeight: '80%' }]}>
          <View style={s.bsHandle} />
          <View style={s.holidayHeader}>
            <Text style={s.holidayTitle}>Holiday Calendar</Text>
            <View style={s.holidayCountPill}>
              <Text style={s.holidayCountTxt}>{holidays.length} holidays</Text>
            </View>
          </View>
          <FlatList
            data={holidays}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View style={s.hListHeader}>
                <Text style={[s.hListHeaderTxt, { flex: 1 }]}>Date</Text>
                <Text style={[s.hListHeaderTxt, { flex: 2 }]}>Holiday</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={[s.hItem, index % 2 === 0 && s.hItemAlt]}>
                <View style={s.hDateBadge}>
                  <Text style={s.hDateDay}>{moment(item.holiday_date).format('DD')}</Text>
                  <Text style={s.hDateMon}>{moment(item.holiday_date).format('MMM')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.hName}>{item.holiday_name}</Text>
                  <Text style={s.hWeekday}>{moment(item.holiday_date).format('dddd')}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

export default ApplyLeave;

/* ─────────────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG },
  scrollContent: {
    paddingHorizontal: normalize(14),
    paddingTop:        normalize(12),
    paddingBottom:     normalize(110),
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: normalize(14),
  },
  screenTitle: { fontSize: normalize(20), fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.4 },
  screenSub:   { fontSize: normalize(11), color: TEXT_MUTED, marginTop: 1 },
  holidayBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PURPLE_LIGHT, borderWidth: 1.5, borderColor: PURPLE_MID,
    paddingHorizontal: normalize(11), paddingVertical: normalize(7),
    borderRadius: normalize(10), gap: 5,
  },
  holidayBtnIcon: { fontSize: 14 },
  holidayBtnText: { fontSize: normalize(12), color: PURPLE, fontWeight: '700' },

  /* Card */
  card: {
    backgroundColor: CARD,
    borderRadius: normalize(14),
    padding: normalize(14),
    marginBottom: normalize(11),
    borderWidth: 1,
    borderColor: '#D4D9E6',          // ← visible card border
    shadowColor: '#6B7A99',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: normalize(10), fontWeight: '800', color: TEXT_MUTED,
    letterSpacing: 1, marginBottom: normalize(10),
  },
  cardTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: normalize(10),
  },

  /* Date pills */
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  datePillFrom: {
    flex: 1, alignItems: 'center', paddingVertical: normalize(11),
    borderRadius: normalize(11), borderWidth: 2, borderColor: PURPLE,
    backgroundColor: PURPLE_LIGHT,
  },
  datePillTo: {
    flex: 1, alignItems: 'center', paddingVertical: normalize(11),
    borderRadius: normalize(11), borderWidth: 2, borderColor: GREEN_BORDER,
    backgroundColor: GREEN_LIGHT,
  },
  pillDisabled: { backgroundColor: '#F0F2F6', borderColor: BORDER, opacity: 0.55 },
  pillTag:  { fontSize: normalize(8.5), fontWeight: '800', color: TEXT_MUTED, letterSpacing: 1, marginBottom: 2 },
  pillDay:  { fontSize: normalize(10), color: TEXT_MID, marginBottom: 2 },
  pillDate: { fontSize: normalize(12.5), fontWeight: '800', color: TEXT_DARK },

  pillMid:    { alignItems: 'center', paddingHorizontal: normalize(6) },
  arrowLine:  { width: 20, height: 1.5, backgroundColor: '#B8C0CC' },
  daysBubble: {
    alignItems: 'center', paddingHorizontal: normalize(8), paddingVertical: normalize(4),
    backgroundColor: '#F0F2F8', borderRadius: normalize(20),
    borderWidth: 1.5, borderColor: BORDER,
    marginVertical: 3,
  },
  daysBubbleTxt: { fontSize: normalize(12), fontWeight: '800', color: TEXT_DARK },
  daysBubbleSub: { fontSize: normalize(9), color: TEXT_MUTED, marginTop: 1 },

  /* Half day */
  halfRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: normalize(12), paddingTop: normalize(11),
    borderTopWidth: 1.5, borderTopColor: '#E2E8F0', gap: normalize(10),
  },
  halfIcon:  { fontSize: 18 },
  halfLabel: { fontSize: normalize(13), fontWeight: '700', color: TEXT_DARK },
  halfHint:  { fontSize: normalize(10), color: TEXT_MUTED, marginTop: 1 },

  periodRow: { flexDirection: 'row', gap: normalize(9), marginTop: normalize(10) },
  periodBtn: {
    flex: 1, paddingVertical: normalize(9), borderRadius: normalize(10),
    alignItems: 'center', backgroundColor: '#F0F2F8',
    borderWidth: 2, borderColor: BORDER,
  },
  periodBtnOn: { backgroundColor: PURPLE_LIGHT, borderColor: PURPLE },
  periodTxt:   { fontSize: normalize(12), color: TEXT_MID, fontWeight: '600' },
  periodTxtOn: { color: PURPLE, fontWeight: '800' },

  /* Dropdown */
  dropdown: {
    height: normalize(46), borderColor: BORDER, borderWidth: 2,
    borderRadius: normalize(11), paddingHorizontal: normalize(12),
    backgroundColor: '#F7F9FC',
  },
  dropdownFocused:  { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
  ddContainer: {
    borderRadius: normalize(12), borderWidth: 0, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 12, backgroundColor: '#fff',
  },
  ddPlaceholder: { fontSize: normalize(13), color: TEXT_MUTED },
  ddSelected:    { fontSize: normalize(13), color: TEXT_DARK, fontWeight: '700' },
  ddSearch:      { fontSize: normalize(12), color: TEXT_DARK },
  ddIcon:        { width: 18, height: 18 },
  ddDot:         { width: 10, height: 10, borderRadius: 5, marginRight: 10 },

  ddItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: normalize(11), paddingHorizontal: normalize(14),
    borderBottomWidth: 1, borderBottomColor: '#F0F2F8',
  },
  ddItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  ddItemName: { fontSize: normalize(13), color: TEXT_DARK, fontWeight: '500' },

  badge:        { paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(20) },
  badgeGreen:   { backgroundColor: '#E3F9EE' },
  badgeOrange:  { backgroundColor: '#FFF3E0' },
  badgeRed:     { backgroundColor: '#FEECEC' },
  badgeTxt:     { fontSize: normalize(11), fontWeight: '700' },
  badgeGreenTxt:  { color: GREEN },
  badgeOrangeTxt: { color: '#C05621' },
  badgeRedTxt:    { color: '#C53030' },

  /* Reason TextInput */
  reasonInput: {
    height: normalize(88),
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: normalize(11),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    fontSize: normalize(13.5),
    color: TEXT_DARK,
    backgroundColor: '#F7F9FC',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: normalize(20),
  },
  reasonInputFocused: {
    borderColor: PURPLE,
    backgroundColor: PURPLE_LIGHT,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  charCount: { fontSize: normalize(10.5), color: '#B0BAC6', textAlign: 'right', marginTop: normalize(5) },

  /* Optional badge */
  optBadge: {
    backgroundColor: '#EDF2F7', paddingHorizontal: normalize(8),
    paddingVertical: normalize(2), borderRadius: normalize(20), borderWidth: 1, borderColor: BORDER,
  },
  optBadgeTxt: { fontSize: normalize(10), color: TEXT_MID, fontWeight: '600' },

  /* File upload */
  uploadZone: {
    alignItems: 'center', paddingVertical: normalize(18),
    borderRadius: normalize(11), borderWidth: 2,
    borderColor: BORDER, borderStyle: 'dashed',
    backgroundColor: '#F7F9FC',
  },
  uploadTxt:  { fontSize: normalize(13), color: TEXT_MID, fontWeight: '700' },
  uploadHint: { fontSize: normalize(10.5), color: TEXT_MUTED, marginTop: 3 },

  fileAttached: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GREEN_LIGHT, borderRadius: normalize(11),
    padding: normalize(11), borderWidth: 2, borderColor: GREEN_BORDER,
  },
  fileIcon: {
    width: normalize(38), height: normalize(38), borderRadius: normalize(9),
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: normalize(11),
  },
  fileName: { fontSize: normalize(12.5), fontWeight: '700', color: TEXT_DARK },
  fileSize:  { fontSize: normalize(10.5), color: GREEN, marginTop: 2 },
  removeBtn: {
    width: normalize(26), height: normalize(26), borderRadius: normalize(13),
    backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FCA5A5',
  },
  removeTxt: { fontSize: normalize(12), color: '#DC2626', fontWeight: '700' },

  /* Submit */
  submitBtn: {
    backgroundColor: PURPLE, borderRadius: normalize(13),
    paddingVertical: normalize(15), alignItems: 'center',
    marginTop: normalize(4),
    shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  submitBtnOff: { backgroundColor: '#C0C7D4', shadowOpacity: 0, elevation: 0 },
  submitTxt: { color: '#fff', fontSize: normalize(15), fontWeight: '800', letterSpacing: 0.2 },

  /* Bottom sheet */
  bsModal: { justifyContent: 'flex-end', margin: 0 },
  bs: {
    backgroundColor: '#fff', borderTopLeftRadius: normalize(22), borderTopRightRadius: normalize(22),
    paddingHorizontal: normalize(18), paddingTop: normalize(10), paddingBottom: normalize(38),
  },
  bsHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D9E0',
    alignSelf: 'center', marginBottom: normalize(14),
  },
  bsTitle: {
    fontSize: normalize(16), fontWeight: '800', color: TEXT_DARK,
    textAlign: 'center', marginBottom: normalize(16),
  },
  sheetOpt: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: normalize(13),
    borderBottomWidth: 1.5, borderBottomColor: '#EEF1F6', gap: normalize(13),
  },
  sheetOptIcon: {
    width: normalize(42), height: normalize(42), borderRadius: normalize(11),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#D4D9E6',
  },
  sheetOptTitle: { fontSize: normalize(13.5), fontWeight: '700', color: TEXT_DARK },
  sheetOptSub:   { fontSize: normalize(11.5), color: TEXT_MUTED, marginTop: 2 },
  sheetCancel: {
    alignItems: 'center', marginTop: normalize(14), paddingVertical: normalize(11),
    borderRadius: normalize(10), borderWidth: 1.5, borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  sheetCancelTxt: { fontSize: normalize(14), color: '#DC2626', fontWeight: '700' },

  /* Holiday list */
  holidayHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: normalize(12),
  },
  holidayTitle:    { fontSize: normalize(16), fontWeight: '800', color: TEXT_DARK },
  holidayCountPill: {
    backgroundColor: PURPLE_LIGHT, paddingHorizontal: normalize(10), paddingVertical: normalize(4),
    borderRadius: normalize(20), borderWidth: 1.5, borderColor: PURPLE_MID,
  },
  holidayCountTxt: { fontSize: normalize(11), color: PURPLE, fontWeight: '700' },
  hListHeader: {
    flexDirection: 'row', paddingVertical: normalize(7), paddingHorizontal: normalize(4),
    borderBottomWidth: 2, borderBottomColor: '#E2E8F0', marginBottom: normalize(4),
  },
  hListHeaderTxt: { fontSize: normalize(10), fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.7 },
  hItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: normalize(9), paddingHorizontal: normalize(4),
    borderRadius: normalize(8), gap: normalize(12),
  },
  hItemAlt: { backgroundColor: '#F7F9FC' },
  hDateBadge: {
    width: normalize(42), height: normalize(42), borderRadius: normalize(10),
    backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: PURPLE_MID,
  },
  hDateDay: { fontSize: normalize(14), fontWeight: '900', color: PURPLE, lineHeight: normalize(16) },
  hDateMon: { fontSize: normalize(9), fontWeight: '700', color: PURPLE, textTransform: 'uppercase' },
  hName:    { fontSize: normalize(12.5), fontWeight: '700', color: TEXT_DARK },
  hWeekday: { fontSize: normalize(10.5), color: TEXT_MUTED, marginTop: 1 },
});