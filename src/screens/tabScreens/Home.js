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

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg: '#f1f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  subtext: '#64748b',
  label: '#94a3b8',
  accent: '#2563eb',
  dotBorder: '#ffffff',
  divider: '#f1f5f9',
  toggleBg: '#e2e8f0',
  toggleIcon: '🌙',
  photoLabel: '#475569',
  photoBg: '#f8fafc',
  photoBorder: '#e2e8f0',
};

const DARK = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  label: '#64748b',
  accent: '#38bdf8',
  dotBorder: '#1e293b',
  divider: '#0f172a',
  toggleBg: '#334155',
  toggleIcon: '☀️',
  photoLabel: '#94a3b8',
  photoBg: '#0f172a',
  photoBorder: '#334155',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * API status values:
 *   "not_clocked_in" → Clock In button
 *   "clocked_in"     → Clock Out button  (check_in set, check_out null)
 *   "completed"      → Attendance complete (check_in + check_out both set)
 */
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
  if (!response) return { text: '—', color: '#94a3b8' };
  const { status } = response;
  if (status === 'clocked_in') return { text: 'Clocked In', color: '#22c55e' };
  if (status === 'completed') return { text: 'Completed', color: '#3b82f6' };
  return { text: 'Not Clocked', color: '#ef4444' };
};

const formatMinutes = minutes => {
  if (!minutes) return '0h 00m';
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(
    2,
    '0',
  )}m`;
};

const formatElapsed = totalSeconds => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(
    s,
  ).padStart(2, '0')}`;
};

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '?';

// ─── Permission helpers ───────────────────────────────────────────────────────
const openAppSettings = () =>
  Platform.OS === 'ios'
    ? Linking.openURL('app-settings:')
    : Linking.openSettings();

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
  return false; // permanently denied
};

// ─── Component ────────────────────────────────────────────────────────────────
let reduxStatus = '';

const Home = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const ProfileReducer = useSelector(s => s.ProfileReducer);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewUri, setPreviewUri] = useState(null); // full-screen photo preview

  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const T = isDark ? DARK : LIGHT;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const userDetails = ProfileReducer?.userDetailsResponse || {};
  const attendResp = ProfileReducer?.attendenceStatusResponse || {};

  // ── Live elapsed timer (only while clocked_in) ───────────────────────────────
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (attendResp?.status === 'clocked_in' && attendResp?.check_in) {
      const initial = Math.max(
        0,
        Math.floor(moment().diff(moment(attendResp.check_in), 'seconds')),
      );
      setElapsedSeconds(initial);
      timerRef.current = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

  // ── Clock action: sequential permissions → GPS → navigate ────────────────────
  const handleClockAction = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Checking location permission...');

      const locGranted = await requestLocationPermission();
      if (!locGranted) {
        setLoading(false);
        setLoadingMessage('');
        showSettingsAlert('Location');
        return;
      }

      setLoadingMessage('Checking camera permission...');
      const camGranted = await requestCameraPermission();
      if (!camGranted) {
        setLoading(false);
        setLoadingMessage('');
        showSettingsAlert('Camera');
        return;
      }

      setLoadingMessage('Fetching your location...');
      const locationData = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          pos =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          err => {
            const msgs = {
              1: 'Permission denied.',
              2: 'Unavailable.',
              3: 'Timed out.',
            };
            reject(
              new Error(
                'Unable to fetch location. ' + (msgs[err.code] || 'Try again.'),
              ),
            );
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        );
      });

      setLoading(false);
      setLoadingMessage('');

      props.navigation.navigate('Attendence', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        pagename: 'Home',
        attendenceStatus:
          attendResp?.status === 'clocked_in' ? 'clockout' : 'clockin',
      });
    } catch (error) {
      setLoading(false);
      setLoadingMessage('');
      showErrorAlert(
        error.message || 'Failed to get location. Please try again.',
      );
    }
  };

  if (reduxStatus === '' || ProfileReducer.status !== reduxStatus) {
    reduxStatus = ProfileReducer.status;
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const clockState = deriveClockState(attendResp);
  const attLabel = deriveAttendanceLabel(attendResp);

  const fullName =
    `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`.trim() ||
    '—';
  const initials = getInitials(userDetails?.first_name, userDetails?.last_name);
  const empCode = userDetails?.employee_code || '';
  const phone = userDetails?.phone || '—';
  const workLocation = userDetails?.work_location || '—';
  const userStatus = userDetails?.status || '';

  const isLiveTimer = attendResp?.status === 'clocked_in';
  const isCompleted = attendResp?.status === 'completed';

  const hoursDisplay = isLiveTimer
    ? formatElapsed(elapsedSeconds)
    : isCompleted
    ? formatMinutes(attendResp?.working_minutes)
    : '—';

  // Single photo slot logic:
  // • default (not clocked in) → default placeholder image
  // • clocked_in              → check_in_picture
  // • completed               → check_out_picture
  let photoUri = null; // null = show default placeholder
  let photoLabel = 'No Attendance Yet';
  let photoTime = '';
  let photoLabelColor = T.label;

  if (isCompleted && attendResp?.check_out_picture) {
    photoUri = attendResp.check_out_picture;
    photoLabel = 'Check-Out Photo';
    photoTime = attendResp.check_out
      ? moment(attendResp.check_out).local().format('h:mm A')
      : '';
    photoLabelColor = '#f97316';
  } else if (isLiveTimer && attendResp?.check_in_picture) {
    photoUri = attendResp.check_in_picture;
    photoLabel = 'Check-In Photo';
    photoTime = attendResp.check_in
      ? moment(attendResp.check_in).local().format('h:mm A')
      : '';
    photoLabelColor = '#22c55e';
  }

  const btnColors = { in: '#22c55e', out: '#f97316', done: '#3b82f6' };
  const btnColor = btnColors[clockState.colorKey];

  const s = makeStyles(T);

  return (
    <View style={s.root}>
      <Header
        HeaderLogo
        Title
        placeText={'Home'}
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

      {/* ── Full-screen photo preview modal ── */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <TouchableOpacity
          style={s.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}
        >
          <Image
            source={{ uri: previewUri }}
            style={s.previewImage}
            resizeMode="contain"
          />
          <Text style={s.previewClose}>✕ Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ── Top bar ── */}
          <View style={s.topRow}>
            <View>
              <Text style={s.dateDayText}>
                {moment().format('dddd').toUpperCase()}
              </Text>
              <Text style={s.dateFullText}>
                {moment().format('MMM D, YYYY')}
              </Text>
            </View>
            <TouchableOpacity
              style={s.themeToggle}
              onPress={() => setIsDark(p => !p)}
              activeOpacity={0.8}
            >
              <Text style={s.themeToggleIcon}>{T.toggleIcon}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Profile Card ── */}
          <View style={s.profileCard}>
            <View style={s.avatarWrapper}>
              {userDetails?.photo ? (
                <Image
                  resizeMode="cover"
                  style={s.avatar}
                  source={{ uri: userDetails.photo }}
                />
              ) : (
                <View style={[s.avatar, s.initialsBox]}>
                  <Text style={s.initialsText}>{initials}</Text>
                </View>
              )}
              <View
                style={[s.onlineDot, { backgroundColor: attLabel.color }]}
              />
            </View>

            <View style={s.profileInfo}>
              <View style={s.nameRow}>
                <Text style={s.userName} numberOfLines={1}>
                  {fullName}
                </Text>
                {!!userStatus && (
                  <View
                    style={[
                      s.badge,
                      {
                        backgroundColor:
                          userStatus === 'active' ? '#dcfce7' : '#fee2e2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.badgeText,
                        {
                          color:
                            userStatus === 'active' ? '#16a34a' : '#dc2626',
                        },
                      ]}
                    >
                      {userStatus}
                    </Text>
                  </View>
                )}
              </View>
              {!!empCode && <Text style={s.empCode}>{empCode}</Text>}
              <View style={s.metaRow}>
                <View style={s.metaChip}>
                  <Text style={s.metaIcon}>📞</Text>
                  <Text style={s.metaText}>{phone}</Text>
                </View>
                <View style={s.metaChip}>
                  <Text style={s.metaIcon}>📍</Text>
                  <Text style={s.metaText}>{workLocation}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Stats bar ── */}
          <View style={s.statsBar}>
            <View style={s.statCell}>
              <Text style={s.statLabel}>Status</Text>
              <Text
                style={[s.statValue, { color: attLabel.color }]}
                numberOfLines={1}
              >
                {attLabel.text}
              </Text>
            </View>
            <View style={s.vDivider} />
            <View style={s.statCell}>
              <Text style={s.statLabel}>In</Text>
              <Text style={s.statValue}>
                {attendResp?.check_in
                  ? moment(attendResp.check_in).local().format('h:mm A')
                  : '—'}
              </Text>
            </View>
            <View style={s.vDivider} />
            <View style={s.statCell}>
              <Text style={s.statLabel}>Out</Text>
              <Text style={s.statValue}>
                {attendResp?.check_out
                  ? moment(attendResp.check_out).local().format('h:mm A')
                  : '—'}
              </Text>
            </View>
            <View style={s.vDivider} />
            <View style={s.statCell}>
              <Text style={s.statLabel}>
                {isLiveTimer ? 'Elapsed' : 'Hours'}
              </Text>
              <Text style={[s.statValue, isLiveTimer && { color: '#22c55e' }]}>
                {hoursDisplay}
              </Text>
            </View>
          </View>

          {/* ── Live timer pill ── */}
          {isLiveTimer && (
            <View style={s.timerPill}>
              <View style={s.timerDot} />
              <Text style={s.timerLabel}>Live </Text>
              <Text style={s.timerValue}>{formatElapsed(elapsedSeconds)}</Text>
            </View>
          )}

          {/* ── Attendance Photo (single slot, always visible) ── */}
          <View style={s.photoCard}>
            <View style={s.photoHeader}>
              <View
                style={[s.photoLabelDot, { backgroundColor: photoLabelColor }]}
              />
              <Text style={[s.photoLabelText, { color: photoLabelColor }]}>
                {photoLabel}
              </Text>
              {!!photoTime && <Text style={s.photoTime}>{photoTime}</Text>}
            </View>

            <TouchableOpacity
              activeOpacity={photoUri ? 0.85 : 1}
              onPress={() => photoUri && setPreviewUri(photoUri)}
              style={s.photoThumbWrap}
            >
              {photoUri ? (
                <>
                  <Image
                    source={{ uri: photoUri }}
                    style={s.photoThumb}
                    resizeMode="stretch"
                  />
                  <View style={s.photoZoomBadge}>
                    <Text style={s.photoZoomIcon}>🔍</Text>
                  </View>
                </>
              ) : (
                <View style={s.photoPlaceholder}>
                  <Text style={s.photoPlaceholderIcon}>📷</Text>
                  <Text style={s.photoPlaceholderText}>
                    Photo will appear{'\n'}after clock-in
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Clock Button ── */}
          <Animated.View
            style={{
              marginBottom: normalize(100),
              transform: [{ scale: clockState.canAct ? pulseAnim : 1 }],
            }}
          >
            <TouchableOpacity
              disabled={!clockState.canAct}
              style={[
                s.clockBtn,
                {
                  backgroundColor: btnColor,
                  opacity: clockState.canAct ? 1 : 0.6,
                },
              ]}
              onPress={handleClockAction}
              activeOpacity={0.85}
            >
              <Text style={s.clockBtnText}>
                {clockState.colorKey === 'in'
                  ? '▶  '
                  : clockState.colorKey === 'out'
                  ? '⏹  '
                  : '✓  '}
                {clockState.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {!clockState.canAct && (
            <Text style={s.hintText}>
              Your attendance for today is complete.
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Home;

// ─── Dynamic styles factory ────────────────────────────────────────────────────
const makeStyles = T =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: normalize(14),
      paddingTop: normalize(10),
      paddingBottom: normalize(60),
    },

    // Top row
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: normalize(10),
    },
    dateDayText: {
      fontSize: normalize(10),
      color: T.label,
      fontFamily: Fonts.MulishSemiBold,
      letterSpacing: 1.5,
    },
    dateFullText: {
      fontSize: normalize(17),
      color: T.text,
      fontFamily: Fonts.MulishExtraBold,
      marginTop: 1,
    },
    themeToggle: {
      backgroundColor: T.toggleBg,
      borderRadius: normalize(18),
      width: normalize(34),
      height: normalize(34),
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeToggleIcon: { fontSize: normalize(15) },

    // Profile card
    profileCard: {
      backgroundColor: T.card,
      borderRadius: normalize(14),
      padding: normalize(12),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalize(10),
      borderWidth: 1,
      borderColor: T.border,
      gap: normalize(12),
    },
    avatarWrapper: { position: 'relative' },
    avatar: {
      height: normalize(60),
      width: normalize(60),
      borderRadius: normalize(30),
      borderWidth: 2,
      borderColor: T.border,
    },
    initialsBox: {
      backgroundColor: T.accent + '1a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    initialsText: {
      fontSize: normalize(20),
      color: T.accent,
      fontFamily: Fonts.MulishExtraBold,
    },
    onlineDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: normalize(12),
      height: normalize(12),
      borderRadius: normalize(6),
      borderWidth: 2,
      borderColor: T.dotBorder,
    },
    profileInfo: { flex: 1 },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(6),
      marginBottom: 2,
    },
    userName: {
      fontSize: normalize(15),
      color: T.text,
      fontFamily: Fonts.MulishExtraBold,
      flex: 1,
    },
    badge: {
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(2),
      borderRadius: normalize(5),
    },
    badgeText: {
      fontSize: normalize(9),
      fontFamily: Fonts.MulishSemiBold,
      textTransform: 'capitalize',
    },
    empCode: {
      fontSize: normalize(11),
      color: T.accent,
      fontFamily: Fonts.MulishSemiBold,
      marginBottom: normalize(4),
      letterSpacing: 0.5,
    },
    metaRow: { flexDirection: 'row', gap: normalize(10), flexWrap: 'wrap' },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: normalize(3) },
    metaIcon: { fontSize: normalize(11) },
    metaText: {
      fontSize: normalize(11),
      color: T.subtext,
      fontFamily: Fonts.MulishMedium,
    },

    // Stats bar
    statsBar: {
      backgroundColor: T.card,
      borderRadius: normalize(12),
      borderWidth: 1,
      borderColor: T.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: normalize(10),
      marginBottom: normalize(10),
    },
    statCell: { flex: 1, alignItems: 'center' },
    vDivider: { width: 1, height: normalize(28), backgroundColor: T.divider },
    statLabel: {
      fontSize: normalize(9),
      color: T.label,
      fontFamily: Fonts.MulishSemiBold,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 3,
    },
    statValue: {
      fontSize: normalize(10),
      color: T.text,
      fontFamily: Fonts.MulishExtraBold,
    },

    // Live timer pill
    timerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: '#dcfce7',
      borderRadius: normalize(20),
      paddingVertical: normalize(5),
      paddingHorizontal: normalize(14),
      marginBottom: normalize(10),
      gap: normalize(6),
    },
    timerDot: {
      width: normalize(7),
      height: normalize(7),
      borderRadius: normalize(4),
      backgroundColor: '#22c55e',
    },
    timerLabel: {
      fontSize: normalize(11),
      color: '#15803d',
      fontFamily: Fonts.MulishSemiBold,
    },
    timerValue: {
      fontSize: normalize(13),
      color: '#15803d',
      fontFamily: Fonts.MulishExtraBold,
      letterSpacing: 0.5,
    },

    // ── Attendance photo card (single slot) ───────────────────────────────────
    photoCard: {
      backgroundColor: T.card,
      borderRadius: normalize(14),
      borderWidth: 1,
      borderColor: T.border,
      padding: normalize(12),
      marginBottom: normalize(12),
    },
    photoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(6),
      marginBottom: normalize(10),
    },
    photoLabelDot: {
      width: normalize(8),
      height: normalize(8),
      borderRadius: normalize(4),
    },
    photoLabelText: {
      fontSize: normalize(12),
      fontFamily: Fonts.MulishExtraBold,
      flex: 1,
    },
    photoTime: {
      fontSize: normalize(11),
      color: T.subtext,
      fontFamily: Fonts.MulishMedium,
    },

    photoThumbWrap: {
      width: '100%',
      height: normalize(180),
      borderRadius: normalize(10),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: T.border,
    },
    photoThumb: { width: '100%', height: '100%' },
    photoZoomBadge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: normalize(12),
      paddingHorizontal: normalize(7),
      paddingVertical: normalize(3),
    },
    photoZoomIcon: { fontSize: normalize(13) },

    // Placeholder state (no photo yet)
    photoPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: T.photoBg,
      gap: normalize(6),
    },
    photoPlaceholderIcon: { fontSize: normalize(32) },
    photoPlaceholderText: {
      fontSize: normalize(12),
      color: T.label,
      fontFamily: Fonts.MulishMedium,
      textAlign: 'center',
      lineHeight: normalize(18),
    },

    // Clock button
    clockBtn: {
      borderRadius: normalize(12),
      paddingVertical: normalize(15),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    clockBtnText: {
      fontSize: normalize(17),
      color: '#fff',
      fontFamily: Fonts.MulishExtraBold,
      letterSpacing: 0.3,
    },

    hintText: {
      textAlign: 'center',
      fontSize: normalize(11),
      marginBottom: normalize(100),
      color: T.label,
      fontFamily: Fonts.MulishMedium,
    },

    // Full-screen photo preview
    previewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewImage: { width: '95%', height: '80%' },
    previewClose: {
      marginTop: normalize(16),
      color: '#94a3b8',
      fontFamily: Fonts.MulishMedium,
      fontSize: normalize(13),
    },
  });
