import {
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Modal,
  StatusBar,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import { Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../utils/helpers/Loader';
import connectionrequest from '../../utils/helpers/NetInfo';
import {
  attendenceStatusRequest,
  userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#F0F4FF',
  card:       '#FFFFFF',
  border:     '#E8EDF5',
  text:       '#0D1B3E',
  subtext:    '#5B6B8A',
  label:      '#9BA8C0',
  accent:     '#3B5BDB',
  accentMid:  '#4C6EF5',
  accentSoft: '#EEF2FF',
  green:      '#12B76A',
  greenBg:    '#ECFDF5',
  orange:     '#F97316',
  orangeBg:   '#FFF7ED',
  blue:       '#3B82F6',
  blueBg:     '#EFF6FF',
  danger:     '#EF4444',
  heroTop:    '#1E3A8A',
  heroBot:    '#3B5BDB',
  white:      '#FFFFFF',
  shadow:     'rgba(59, 91, 219, 0.14)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deriveClockState = response => {
  if (!response) return { label: 'Clock In', canAct: true, colorKey: 'in' };
  const { status } = response;
  if (status === 'completed')
    return { label: 'Attendance Complete', canAct: false, colorKey: 'done' };
  if (status === 'clocked_in')
    return { label: 'Clock Out', canAct: true, colorKey: 'out' };
  return { label: 'Clock In', canAct: true, colorKey: 'in' };
};

const deriveAttendanceLabel = response => {
  if (!response) return { text: 'Not Clocked', color: C.danger };
  const { status } = response;
  if (status === 'clocked_in') return { text: 'Clocked In', color: C.green };
  if (status === 'completed')  return { text: 'Completed',  color: C.blue };
  return { text: 'Not Clocked', color: C.danger };
};

const formatMinutes = minutes => {
  if (!minutes) return '0h 00m';
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const formatElapsed = totalSeconds => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '?';

// ─── Permission helpers ───────────────────────────────────────────────────────
const openAppSettings = () =>
  Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();

const showSettingsAlert = permissionType => {
  Alert.alert(
    `${permissionType} Permission Required`,
    `${permissionType} access is needed to mark attendance. Enable it in Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ],
  );
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') return true;
  const already = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (already) return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission Required',
      message: 'This app needs location access to mark your attendance.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const requestCameraPermission = async () => {
  const current = await Camera.getCameraPermissionStatus();
  if (current === 'granted') return true;
  if (current === 'not-determined') {
    const next = await Camera.requestCameraPermission();
    return next === 'granted';
  }
  return false;
};

// ─── Component ────────────────────────────────────────────────────────────────
let reduxStatus = '';

const Home = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const ProfileReducer = useSelector(s => s.ProfileReducer);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewUri, setPreviewUri] = useState(null);

  const timerRef   = useRef(null);
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 450, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.035, duration: 900,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, duration: 900,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const userDetails = ProfileReducer?.userDetailsResponse || {};
  const attendResp  = ProfileReducer?.attendenceStatusResponse || {};

  // ── Live timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (attendResp?.status === 'clocked_in' && attendResp?.check_in) {
      const initial = Math.max(0, Math.floor(moment().diff(moment(attendResp.check_in), 'seconds')));
      setElapsedSeconds(initial);
      timerRef.current = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [attendResp?.status, attendResp?.check_in]);

  // ── Fetch on focus ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFocused) return;
    connectionrequest()
      .then(() => {
        dispatch(attendenceStatusRequest());
        dispatch(userDetailsRequest());
      })
      .catch(() => showErrorAlert('Please connect to internet'));
  }, [isFocused]);

  // ── Clock action ─────────────────────────────────────────────────────────────
  const handleClockAction = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Checking location permission...');
      const locGranted = await requestLocationPermission();
      if (!locGranted) { setLoading(false); setLoadingMessage(''); showSettingsAlert('Location'); return; }

      setLoadingMessage('Checking camera permission...');
      const camGranted = await requestCameraPermission();
      if (!camGranted) { setLoading(false); setLoadingMessage(''); showSettingsAlert('Camera'); return; }

      setLoadingMessage('Fetching your location...');
      const locationData = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          err => {
            const msgs = { 1: 'Permission denied.', 2: 'Unavailable.', 3: 'Timed out.' };
            reject(new Error('Unable to fetch location. ' + (msgs[err.code] || 'Try again.')));
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        );
      });

      setLoading(false); setLoadingMessage('');
      props.navigation.navigate('Attendence', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        pagename: 'Home',
        attendenceStatus: attendResp?.status === 'clocked_in' ? 'clockout' : 'clockin',
      });
    } catch (error) {
      setLoading(false); setLoadingMessage('');
      showErrorAlert(error.message || 'Failed to get location. Please try again.');
    }
  };

  if (reduxStatus === '' || ProfileReducer.status !== reduxStatus) {
    reduxStatus = ProfileReducer.status;
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const clockState  = deriveClockState(attendResp);
  const attLabel    = deriveAttendanceLabel(attendResp);

  const fullName    = `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`.trim() || '—';
  const initials    = getInitials(userDetails?.first_name, userDetails?.last_name);
  const empCode     = userDetails?.employee_code || '';
  const phone       = userDetails?.phone || '—';
  const workLocation = userDetails?.work_location || '—';
  const userStatus  = userDetails?.status || '';

  const isLiveTimer = attendResp?.status === 'clocked_in';
  const isCompleted = attendResp?.status === 'completed';

  const hoursDisplay = isLiveTimer
    ? formatElapsed(elapsedSeconds)
    : isCompleted ? formatMinutes(attendResp?.working_minutes) : '—';

  let photoUri = null, photoLabel = 'No Attendance Yet', photoTime = '', photoLabelColor = C.label;
  if (isCompleted && attendResp?.check_out_picture) {
    photoUri = attendResp.check_out_picture; photoLabel = 'Check-Out Photo';
    photoTime = attendResp.check_out ? moment(attendResp.check_out).local().format('h:mm A') : '';
    photoLabelColor = C.orange;
  } else if (isLiveTimer && attendResp?.check_in_picture) {
    photoUri = attendResp.check_in_picture; photoLabel = 'Check-In Photo';
    photoTime = attendResp.check_in ? moment(attendResp.check_in).local().format('h:mm A') : '';
    photoLabelColor = C.green;
  }

  const btnColors = { in: C.green, out: C.orange, done: C.blue };
  const btnColor  = btnColors[clockState.colorKey];

  // Status chip config
  const statusChip = {
    'clocked_in': { bg: C.greenBg, color: C.green, dot: C.green },
    'completed':  { bg: C.blueBg,  color: C.blue,  dot: C.blue },
  }[attendResp?.status] || { bg: '#FEF2F2', color: C.danger, dot: C.danger };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.heroTop} />

      <Header
        HeaderLogo Title placeText={'Home'}
        onPress_back_button={() => {}}
        onPress_right_button={() => props.navigation.navigate('Notification')}
      />

      <Loader
        visible={
          loading ||
          ProfileReducer?.status === 'Profile/clockinRequest' ||
          ProfileReducer?.status === 'Profile/userDetailsRequest'
        }
        loadingText={loadingMessage || 'Loading...'}
      />

      {/* ── Full-screen photo preview ── */}
      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <TouchableOpacity style={s.previewOverlay} activeOpacity={1} onPress={() => setPreviewUri(null)}>
          <Image source={{ uri: previewUri }} style={s.previewImage} resizeMode="contain" />
          <Text style={s.previewClose}>✕  Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Profile Card ── */}
          <View style={s.heroCard}>
            {/* Decorative circle accents */}
            <View style={s.heroCircle1} />
            <View style={s.heroCircle2} />

            <View style={s.heroTop}>
              {/* Avatar */}
              <View style={s.avatarRing}>
                {userDetails?.photo ? (
                  <Image resizeMode="cover" style={s.avatar} source={{ uri: userDetails.photo }} />
                ) : (
                  <View style={[s.avatar, s.initialsBox]}>
                    <Text style={s.initialsText}>{initials}</Text>
                  </View>
                )}
                <View style={[s.onlineDot, { backgroundColor: attLabel.color }]} />
              </View>

              {/* Name / code */}
              <View style={s.heroInfo}>
                <Text style={s.heroName} numberOfLines={1}>{fullName}</Text>
                {!!empCode && <Text style={s.heroCode}>{empCode}</Text>}
                <View style={s.heroMeta}>
                  {!!workLocation && (
                    <View style={s.metaChip}>
                      <Text style={s.metaIcon}>📍</Text>
                      <Text style={s.metaText}>{workLocation}</Text>
                    </View>
                  )}
                  {!!phone && (
                    <View style={s.metaChip}>
                      <Text style={s.metaIcon}>📞</Text>
                      <Text style={s.metaText}>{phone}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Status badge */}
              {!!userStatus && (
                <View style={[s.statusBadge, { backgroundColor: userStatus === 'active' ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[s.statusBadgeText, { color: userStatus === 'active' ? '#15803d' : '#dc2626' }]}>
                    {userStatus}
                  </Text>
                </View>
              )}
            </View>

            {/* Date strip */}
            <View style={s.heroDivider} />
            <View style={s.heroDateRow}>
              <Text style={s.heroWeekday}>{moment().format('dddd').toUpperCase()}</Text>
              <Text style={s.heroDate}>{moment().format('MMMM D, YYYY')}</Text>

              {/* Attendance pill */}
              <View style={[s.attPill, { backgroundColor: statusChip.bg }]}>
                <View style={[s.attPillDot, { backgroundColor: statusChip.dot }]} />
                <Text style={[s.attPillText, { color: statusChip.color }]}>{attLabel.text}</Text>
              </View>
            </View>
          </View>

          {/* ── Stats Row ── */}
          <View style={s.statsRow}>
            {/* Check-In */}
            <View style={s.statBox}>
              <Text style={s.statBoxIcon}>🕐</Text>
              <Text style={s.statBoxLabel}>Check In</Text>
              <Text style={[s.statBoxValue, { color: C.green }]}>
                {attendResp?.check_in ? moment(attendResp.check_in).local().format('h:mm A') : '—'}
              </Text>
            </View>

            {/* Hours / elapsed */}
            <View style={[s.statBox, s.statBoxCenter]}>
              <Text style={s.statBoxIcon}>{isLiveTimer ? '⏱' : '⌚'}</Text>
              <Text style={s.statBoxLabel}>{isLiveTimer ? 'Elapsed' : 'Hours'}</Text>
              <Text style={[s.statBoxValue, { color: isLiveTimer ? C.green : C.accent }]}>
                {hoursDisplay}
              </Text>
              {isLiveTimer && (
                <View style={s.liveDotRow}>
                  <View style={s.liveDot} />
                  <Text style={s.liveLabel}>LIVE</Text>
                </View>
              )}
            </View>

            {/* Check-Out */}
            <View style={s.statBox}>
              <Text style={s.statBoxIcon}>🕔</Text>
              <Text style={s.statBoxLabel}>Check Out</Text>
              <Text style={[s.statBoxValue, { color: C.orange }]}>
                {attendResp?.check_out ? moment(attendResp.check_out).local().format('h:mm A') : '—'}
              </Text>
            </View>
          </View>

          {/* ── Photo Card ── */}
          <View style={s.photoCard}>
            <View style={s.photoCardHeader}>
              <View style={[s.photoLabelDot, { backgroundColor: photoLabelColor }]} />
              <Text style={[s.photoLabelText, { color: photoLabelColor }]}>{photoLabel}</Text>
              {!!photoTime && <Text style={s.photoTime}>{photoTime}</Text>}
            </View>

            <TouchableOpacity
              activeOpacity={photoUri ? 0.88 : 1}
              onPress={() => photoUri && setPreviewUri(photoUri)}
              style={s.photoThumbWrap}
            >
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={s.photoThumb} resizeMode="cover" />
                  <View style={s.photoZoomBadge}>
                    <Text style={s.photoZoomIcon}>🔍</Text>
                  </View>
                </>
              ) : (
                <View style={s.photoPlaceholder}>
                  <Text style={s.photoPlaceholderIcon}>📷</Text>
                  <Text style={s.photoPlaceholderText}>Photo will appear{'\n'}after clock-in</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Clock Button ── */}
          <Animated.View style={{ transform: [{ scale: clockState.canAct ? pulseAnim : 1 }], marginBottom: normalize(8) }}>
            <TouchableOpacity
              disabled={!clockState.canAct}
              style={[s.clockBtn, { backgroundColor: btnColor, opacity: clockState.canAct ? 1 : 0.55 }]}
              onPress={handleClockAction}
              activeOpacity={0.86}
            >
              <Text style={s.clockBtnIcon}>
                {clockState.colorKey === 'in' ? '▶' : clockState.colorKey === 'out' ? '⏹' : '✓'}
              </Text>
              <Text style={s.clockBtnText}>{clockState.label}</Text>
            </TouchableOpacity>
          </Animated.View>

          {!clockState.canAct && (
            <Text style={s.hintText}>Attendance for today is complete.</Text>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Home;

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: normalize(14),
    paddingTop: normalize(10),
    paddingBottom: normalize(100),
  },

  // ── Hero card ─────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: C.accent,
    borderRadius: normalize(18),
    padding: normalize(14),
    marginBottom: normalize(10),
    overflow: 'hidden',
    // shadow
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  heroCircle1: {
    position: 'absolute', top: -normalize(30), right: -normalize(20),
    width: normalize(110), height: normalize(110),
    borderRadius: normalize(55),
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroCircle2: {
    position: 'absolute', bottom: normalize(30), right: normalize(10),
    width: normalize(60), height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  heroTop: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },

  avatarRing: { position: 'relative' },
  avatar: {
    height: normalize(52), width: normalize(52), borderRadius: normalize(26),
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  initialsBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  initialsText: {
    fontSize: normalize(18), color: C.white, fontFamily: Fonts.MulishExtraBold,
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: normalize(11), height: normalize(11), borderRadius: normalize(6),
    borderWidth: 2, borderColor: C.accent,
  },

  heroInfo: { flex: 1 },
  heroName: {
    fontSize: normalize(15), color: C.white, fontFamily: Fonts.MulishExtraBold, marginBottom: 1,
  },
  heroCode: {
    fontSize: normalize(10), color: 'rgba(255,255,255,0.65)', fontFamily: Fonts.MulishSemiBold,
    letterSpacing: 0.6, marginBottom: normalize(4),
  },
  heroMeta: { flexDirection: 'row', gap: normalize(8), flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: normalize(3) },
  metaIcon: { fontSize: normalize(10) },
  metaText: { fontSize: normalize(10), color: 'rgba(255,255,255,0.72)', fontFamily: Fonts.MulishMedium },

  statusBadge: {
    paddingHorizontal: normalize(7), paddingVertical: normalize(3),
    borderRadius: normalize(6), alignSelf: 'flex-start',
  },
  statusBadgeText: { fontSize: normalize(9), fontFamily: Fonts.MulishSemiBold, textTransform: 'capitalize' },

  heroDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.14)',
    marginVertical: normalize(10),
  },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  heroWeekday: {
    fontSize: normalize(9), color: 'rgba(255,255,255,0.55)',
    fontFamily: Fonts.MulishSemiBold, letterSpacing: 1.2,
  },
  heroDate: {
    fontSize: normalize(11), color: C.white, fontFamily: Fonts.MulishExtraBold, flex: 1,
  },

  attPill: {
    flexDirection: 'row', alignItems: 'center', gap: normalize(5),
    paddingHorizontal: normalize(8), paddingVertical: normalize(3),
    borderRadius: normalize(20),
  },
  attPillDot: { width: normalize(6), height: normalize(6), borderRadius: normalize(3) },
  attPillText: { fontSize: normalize(10), fontFamily: Fonts.MulishExtraBold },

  // ── Stats row ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row', gap: normalize(8),
    marginBottom: normalize(10),
  },
  statBox: {
    flex: 1, backgroundColor: C.card, borderRadius: normalize(12),
    paddingVertical: normalize(10), paddingHorizontal: normalize(8),
    alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statBoxCenter: {
    borderColor: C.accentSoft, backgroundColor: C.accentSoft,
  },
  statBoxIcon: { fontSize: normalize(16), marginBottom: normalize(3) },
  statBoxLabel: {
    fontSize: normalize(8), color: C.label, fontFamily: Fonts.MulishSemiBold,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: normalize(3),
  },
  statBoxValue: {
    fontSize: normalize(12), fontFamily: Fonts.MulishExtraBold,
  },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(3), marginTop: normalize(3) },
  liveDot: {
    width: normalize(5), height: normalize(5), borderRadius: normalize(3), backgroundColor: C.green,
  },
  liveLabel: { fontSize: normalize(8), color: C.green, fontFamily: Fonts.MulishExtraBold, letterSpacing: 0.8 },

  // ── Photo card ────────────────────────────────────────────────────────────────
  photoCard: {
    backgroundColor: C.card, borderRadius: normalize(14),
    borderWidth: 1, borderColor: C.border,
    padding: normalize(12), marginBottom: normalize(12),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  photoCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: normalize(6), marginBottom: normalize(8),
  },
  photoLabelDot: { width: normalize(7), height: normalize(7), borderRadius: normalize(4) },
  photoLabelText: { fontSize: normalize(12), fontFamily: Fonts.MulishExtraBold, flex: 1 },
  photoTime: { fontSize: normalize(11), color: C.subtext, fontFamily: Fonts.MulishMedium },

  photoThumbWrap: {
    width: '100%', height: normalize(160), borderRadius: normalize(10),
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  photoThumb: { width: '100%', height: '100%' },
  photoZoomBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: normalize(10),
    paddingHorizontal: normalize(7), paddingVertical: normalize(3),
  },
  photoZoomIcon: { fontSize: normalize(13) },

  photoPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FAFC', gap: normalize(5),
  },
  photoPlaceholderIcon: { fontSize: normalize(28) },
  photoPlaceholderText: {
    fontSize: normalize(11), color: C.label, fontFamily: Fonts.MulishMedium,
    textAlign: 'center', lineHeight: normalize(17),
  },

  // ── Clock button ──────────────────────────────────────────────────────────────
  clockBtn: {
    borderRadius: normalize(14), paddingVertical: normalize(14),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: normalize(8),
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  clockBtnIcon: { fontSize: normalize(16), color: C.white },
  clockBtnText: {
    fontSize: normalize(16), color: C.white,
    fontFamily: Fonts.MulishExtraBold, letterSpacing: 0.2,
  },

  hintText: {
    textAlign: 'center', fontSize: normalize(11), color: C.label,
    fontFamily: Fonts.MulishMedium, marginTop: normalize(4),
  },

  // ── Preview modal ─────────────────────────────────────────────────────────────
  previewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.93)',
    justifyContent: 'center', alignItems: 'center',
  },
  previewImage: { width: '95%', height: '80%' },
  previewClose: {
    marginTop: normalize(14), color: '#94a3b8',
    fontFamily: Fonts.MulishMedium, fontSize: normalize(13),
  },
});