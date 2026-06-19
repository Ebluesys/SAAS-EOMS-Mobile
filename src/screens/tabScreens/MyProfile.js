import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import Header from '../../components/Header';
import { Colors, Fonts } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../redux/reducer/AuthReducer';
import {
  profileUpdateRequest,
  registerFaceRequest,
  resetPasswordRequest,
  userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import TextInputWithButton from '../../components/TextInputWithBotton';
import FaceCameraModal from '../../components/FaceCameraModal';
import { useAppTheme } from '../../themes/ThemeContext';

let status = '';

const Icon = ({ name, size = 18 }) => {
  const icons = {
    user: '👤',
    mail: '✉️',
    phone: '📞',
    gender: '⚧',
    building: '🏢',
    badge: '🪪',
    camera: '📷',
  };
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4 }}>
      {icons[name] || '•'}
    </Text>
  );
};

const MyProfile = props => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const scrollViewRef = useRef(null);

  // ── Profile fields ─────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local display copies (read-only view)
  const [localFirstName, setLocalFirstName] = useState('');
  const [localLastName, setLocalLastName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localGender, setLocalGender] = useState('');
  const [localEmployeeCode, setLocalEmployeeCode] = useState('');
  const [localWorkLocation, setLocalWorkLocation] = useState('');
  // Only ever sourced from primary_face_profile.face_image_url — never profile_pic_url.
  const [localFaceImageUrl, setLocalFaceImageUrl] = useState(null);

  // ── Face registration ──────────────────────────────────────────────────────
  const [showFaceFlow, setShowFaceFlow] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [faceAngle, setFaceAngle] = useState('front');
  const [faceWarningChecked, setFaceWarningChecked] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  // ── Face analyzing loader ──────────────────────────────────────────────────
  const [faceAnalyzing, setFaceAnalyzing] = useState(false);
  const [analyzeElapsed, setAnalyzeElapsed] = useState(0); // seconds counter
  const analyzeTimerRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(10)).current;
  const dot0 = useRef(new Animated.Value(0.3)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dotAnims = [dot0, dot1, dot2];
  const scanLoopRef = useRef(null);
  const dotLoopRefs = useRef([]);

  // Start / stop analyzing animations and timer
  useEffect(() => {
    if (faceAnalyzing) {
      // Reset counter
      setAnalyzeElapsed(0);
      analyzeTimerRef.current = setInterval(() => {
        setAnalyzeElapsed(prev => prev + 1);
      }, 1000);

      // Scanning line
      scanAnim.setValue(10);
      scanLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 72,
            duration: 1400,
            useNativeDriver: false,
          }),
          Animated.timing(scanAnim, {
            toValue: 10,
            duration: 1400,
            useNativeDriver: false,
          }),
        ]),
      );
      scanLoopRef.current.start();

      // Bouncing dots with stagger
      dotLoopRefs.current = dotAnims.map((anim, i) => {
        anim.setValue(0.3);
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(i * 180),
            Animated.timing(anim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.delay((2 - i) * 180),
          ]),
        );
        loop.start();
        return loop;
      });
    } else {
      // Clean up
      clearInterval(analyzeTimerRef.current);
      scanLoopRef.current?.stop();
      dotLoopRefs.current.forEach(l => l?.stop());
      setAnalyzeElapsed(0);
    }

    return () => {
      clearInterval(analyzeTimerRef.current);
      scanLoopRef.current?.stop();
      dotLoopRefs.current.forEach(l => l?.stop());
    };
  }, [faceAnalyzing]);

  // ── Reset password ─────────────────────────────────────────────────────────
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getuserDetails();
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.userDetailsResponse) {
      const d = ProfileReducer.userDetailsResponse;
      setFirstName(d?.first_name || '');
      setLastName(d?.last_name || '');
      setEmail(d?.email || '');
      setLocalFirstName(d?.first_name || '');
      setLocalLastName(d?.last_name || '');
      setLocalEmail(d?.email || '');
      setLocalPhone(d?.phone || '');
      setLocalGender(d?.gender || '');
      setLocalEmployeeCode(d?.employee_code || '');
      setLocalWorkLocation(d?.work_location || '');
      setLocalFaceImageUrl(d?.primary_face_profile?.face_image_url || null);
      setFaceRegistered(!!d?.face_registered);
    }
  }, [ProfileReducer?.userDetailsResponse]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getuserDetails() {
    connectionrequest()
      .then(() => dispatch(userDetailsRequest()))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

  const handleEdit = () => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    const d = ProfileReducer?.userDetailsResponse || {};
    setFirstName(d?.first_name || '');
    setLastName(d?.last_name || '');
    setEmail(d?.email || '');
  };

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
    connectionrequest()
      .then(() => dispatch(profileUpdateRequest(formData)))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

  // ── Face flow ──────────────────────────────────────────────────────────────
  const openFaceFlow = () => {
    setFaceImage(null);
    setFaceWarningChecked(false);
    setFaceAngle('front');
    setShowFaceFlow(true);
  };

  const closeFaceFlow = () => {
    setShowFaceFlow(false);
    setFaceImage(null);
    setFaceWarningChecked(false);
  };

  const handleCameraCapture = ({ uri, face_angle }) => {
    setFaceImage(uri);
    setFaceAngle(face_angle);
    setShowCamera(false);
    setShowFaceFlow(true);
  };

  const handleRegisterFace = () => {
    if (!faceImage) {
      showErrorAlert('Please capture your face photo first');
      return;
    }
    if (!faceWarningChecked) {
      showErrorAlert('Please confirm the photo requirements before registering');
      return;
    }
    const imageName = faceImage.split('/').pop();
    const formData = new FormData();
    formData.append('face_angle', faceAngle);
    formData.append('is_primary', true);
    formData.append('face_image', {
      uri:
        Platform.OS === 'android'
          ? faceImage
          : faceImage.replace('file://', ''),
      name: imageName,
      type: 'image/jpeg',
    });

    connectionrequest()
      .then(() => {
        setFaceAnalyzing(true); // start analyzing loader + timer
        dispatch(registerFaceRequest(formData));
      })
      .catch(() => showErrorAlert('Please connect to internet'));
  };

  // ── Reset password ─────────────────────────────────────────────────────────
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
    if (password.length < 6) {
      showErrorAlert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showErrorAlert('Passwords do not match');
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
      .catch(() => showErrorAlert('Please connect to internet'));
  };

  // ── Redux status machine ───────────────────────────────────────────────────
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
      case 'Profile/registerFaceRequest':
        status = ProfileReducer.status;
        setLoading(false); // suppress global loader — we use the analyzing overlay instead
        break;
      case 'Profile/registerFaceSuccess':
        status = ProfileReducer.status;
        setLoading(false);
        setFaceAnalyzing(false); // stop analyzing loader + timer
        setFaceRegistered(true);
        closeFaceFlow();
        getuserDetails();
        break;
      case 'Profile/registerFaceFailure':
        status = ProfileReducer.status;
        setLoading(false);
        setFaceAnalyzing(false); // stop analyzing loader + timer on failure too
        break;
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const fullName =
    [localFirstName || firstName, localLastName || lastName]
      .filter(Boolean)
      .join(' ') || 'User Name';
  const initials =
    [localFirstName || firstName, localLastName || lastName]
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';

  // Timer display helper — e.g. 0:05, 1:02
  const formatElapsed = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const BG = isDarkMode ? '#0F172A' : '#F8FAFC';
  const CARD = isDarkMode ? '#1E293B' : '#FFFFFF';
  const TEXT = isDarkMode ? '#F1F5F9' : '#1E293B';
  const MUTED = isDarkMode ? '#94A3B8' : '#64748B';
  const BORDER = isDarkMode ? '#334155' : '#E2E8F0';
  const ACCENT = '#6366F1';
  const FACE_ACCENT = '#0EA5E9';

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header
        HeaderLogo
        Title
        placeText={'My Profile'}
        onPress_back_button={() => props.navigation.goBack()}
        onPress_right_button={() => props.navigation.navigate('Notification')}
      />
      <Loader visible={loading} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? normalize(90) : normalize(24)
        }>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: normalize(40) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {/* ── Hero Banner ── */}
          <View style={[styles.heroBanner, { backgroundColor: ACCENT }]}>
            <View style={styles.decCircle1} />
            <View style={styles.decCircle2} />

            <TouchableOpacity
              onPress={openFaceFlow}
              activeOpacity={0.85}
              style={styles.avatarWrapper}>
              {localFaceImageUrl ? (
                <Image
                  source={{ uri: localFaceImageUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: '#818CF8' },
                  ]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Icon name="camera" size={15} />
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: faceRegistered ? '#22C55E' : '#F59E0B' },
                ]}
              />
            </TouchableOpacity>

            <Text style={styles.heroName}>{fullName}</Text>
            <View style={styles.badgeRow}>
              {localEmployeeCode ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{localEmployeeCode}</Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: faceRegistered
                      ? 'rgba(34,197,94,0.25)'
                      : 'rgba(245,158,11,0.25)',
                  },
                ]}>
                <Text style={styles.badgeText}>
                  {faceRegistered ? '🛡️ Face Registered' : '⚠️ Face Not Set'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Theme Toggle ── */}
          {!isEditing && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: CARD,
                  borderColor: BORDER,
                  marginTop: normalize(16),
                },
              ]}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 18 }}>
                    {isDarkMode ? '🌙' : '☀️'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: normalize(12) }}>
                  <Text style={[styles.cardRowTitle, { color: TEXT }]}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Text style={[styles.cardRowSub, { color: MUTED }]}>
                    Tap to switch appearance
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                  thumbColor={isDarkMode ? ACCENT : '#fff'}
                />
              </View>
            </View>
          )}

          {/* ── Face Registration Card ── */}
          {!isEditing && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: CARD,
                  borderColor: FACE_ACCENT + '55',
                  borderWidth: 1.5,
                },
              ]}>
              <View style={styles.faceCardHeader}>
                <View
                  style={[
                    styles.faceIconCircle,
                    { backgroundColor: FACE_ACCENT + '18' },
                  ]}>
                  <Text style={{ fontSize: normalize(26) }}>🫠</Text>
                </View>
                <View style={{ flex: 1, marginLeft: normalize(12) }}>
                  <Text style={[styles.cardTitle, { color: TEXT }]}>
                    Face Registration
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: MUTED }]}>
                    Used for attendance marking
                  </Text>
                </View>
                <View
                  style={[
                    styles.faceStatusPill,
                    {
                      backgroundColor: faceRegistered
                        ? '#22C55E18'
                        : '#EF444418',
                    },
                  ]}>
                  <View
                    style={[
                      styles.faceStatusDot,
                      {
                        backgroundColor: faceRegistered ? '#22C55E' : '#EF4444',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.faceStatusText,
                      { color: faceRegistered ? '#16A34A' : '#DC2626' },
                    ]}>
                    {faceRegistered ? 'Registered' : 'Not Set'}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { borderColor: BORDER }]} />

              <View style={styles.faceInfoList}>
                {[
                  {
                    emoji: '💡',
                    text: 'Ensure your face is well-lit from the front',
                  },
                  {
                    emoji: '📸',
                    text: 'Look directly at the camera, neutral expression',
                  },
                  { emoji: '🚫', text: 'Remove glasses, masks, or accessories' },
                ].map((item, i) => (
                  <View key={i} style={styles.faceInfoRow}>
                    <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                    <Text style={[styles.faceInfoText, { color: MUTED }]}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Info / Edit Card ── */}
          {isEditing ? (
            <View
              style={[
                styles.card,
                { backgroundColor: CARD, borderColor: BORDER },
              ]}>
              <Text style={[styles.cardTitle, { color: TEXT }]}>
                Edit Profile
              </Text>
              <Text style={[styles.cardSubtitle, { color: MUTED }]}>
                Update your name or email
              </Text>
              <View style={styles.divider} />
              {[
                {
                  label: 'First Name *',
                  placeholder: 'Enter first name',
                  value: firstName,
                  onChange: setFirstName,
                },
                {
                  label: 'Last Name *',
                  placeholder: 'Enter last name',
                  value: lastName,
                  onChange: setLastName,
                },
                {
                  label: 'Email *',
                  placeholder: 'Enter email',
                  value: email,
                  onChange: setEmail,
                  kb: 'email-address',
                },
              ].map((f, i) => (
                <TextInputWithButton
                  key={i}
                  show
                  icon
                  height={normalize(48)}
                  inputWidth={'100%'}
                  marginTop={normalize(16)}
                  textColor={Colors.textInputColor}
                  InputHeaderText={f.label}
                  placeholder={f.placeholder}
                  placeholderTextColor={MUTED}
                  paddingLeft={normalize(16)}
                  borderColor={BORDER}
                  borderRadius={normalize(10)}
                  editable
                  fontFamily={Fonts.MulishRegular}
                  isheadertext
                  value={f.value}
                  fontSize={normalize(14)}
                  headertxtsize={normalize(12)}
                  onChangeText={e => f.onChange(e)}
                  tintColor={ACCENT}
                  keyboardType={f.kb || 'default'}
                />
              ))}
              <View style={[styles.divider, { marginTop: normalize(20) }]} />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.btnOutline, { borderColor: '#EF4444' }]}
                  onPress={handleCancel}>
                  <Text style={[styles.btnOutlineText, { color: '#EF4444' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnFill, { backgroundColor: ACCENT }]}
                  onPress={onUpdateProfile}>
                  <Text style={styles.btnFillText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { backgroundColor: CARD, borderColor: BORDER },
              ]}>
              <Text style={[styles.cardTitle, { color: TEXT }]}>
                Personal Information
              </Text>
              <Text style={[styles.cardSubtitle, { color: MUTED }]}>
                Your account details
              </Text>
              <View style={styles.divider} />
              <InfoRow
                icon="user"
                label="First Name"
                value={localFirstName}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="user"
                label="Last Name"
                value={localLastName}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="mail"
                label="Email"
                value={localEmail}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="phone"
                label="Phone"
                value={localPhone}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="gender"
                label="Gender"
                value={
                  localGender
                    ? localGender.charAt(0).toUpperCase() + localGender.slice(1)
                    : ''
                }
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="badge"
                label="Employee Code"
                value={localEmployeeCode}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
              />
              <InfoRow
                icon="building"
                label="Work Location"
                value={localWorkLocation}
                TEXT={TEXT}
                MUTED={MUTED}
                ACCENT={ACCENT}
                last
              />
            </View>
          )}

          {/* ── Action Buttons ── */}
          {!isEditing && (
            <View style={styles.actionsGroup}>
              <ActionButton
                label="Edit Profile"
                emoji="✏️"
                bg={ACCENT}
                onPress={handleEdit}
              />
              <ActionButton
                label="Reset Password"
                emoji="🔒"
                bg="#F59E0B"
                onPress={openResetPasswordModal}
              />
              <ActionButton
                label="Logout"
                emoji="🚪"
                bg="#EF4444"
                onPress={() => dispatch(logoutRequest())}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ══════════════════════════════════════════════════════════════════════
          FaceCameraModal
      ══════════════════════════════════════════════════════════════════════ */}
      <FaceCameraModal
        visible={showCamera}
        onClose={() => {
          setShowCamera(false);
          setShowFaceFlow(true);
        }}
        onCapture={handleCameraCapture}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          Face Confirm Sheet
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        animationType="slide"
        transparent
        visible={showFaceFlow}
        onRequestClose={closeFaceFlow}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: CARD }]}>
            <View style={[styles.modalTop, { backgroundColor: FACE_ACCENT }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: normalize(8) }}>
                  🫠
                </Text>
                <Text style={styles.modalTopTitle}>Face Registration</Text>
              </View>
              <TouchableOpacity
                onPress={closeFaceFlow}
                style={styles.modalCloseBtn}
                disabled={faceAnalyzing}>
                <Text
                  style={{
                    color: faceAnalyzing ? 'rgba(255,255,255,0.35)' : '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: normalize(20) }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!faceAnalyzing}>
              {/* Guidance hint */}
              <Text
                style={[
                  styles.faceModalHint,
                  { color: MUTED, borderColor: BORDER },
                ]}>
                💡 Well-lit, front-facing, no glasses or masks
              </Text>

              {/* Photo preview or placeholder */}
              {faceImage ? (
                <View style={styles.previewThumbBox}>
                  <Image
                    source={{ uri: faceImage }}
                    style={styles.previewThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.previewThumbBadge}>
                    <View
                      style={[
                        styles.previewThumbDot,
                        {
                          backgroundColor:
                            faceAngle === 'front' ? '#22D3EE' : '#A78BFA',
                        },
                      ]}
                    />
                    <Text style={styles.previewThumbText}>
                      {faceAngle === 'front' ? 'Front Camera' : 'Back Camera'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyPreview,
                    {
                      borderColor: BORDER,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    },
                  ]}>
                  <Text style={{ fontSize: normalize(40) }}>🫠</Text>
                  <Text style={[styles.emptyPreviewText, { color: MUTED }]}>
                    No photo yet
                  </Text>
                </View>
              )}

              {/* Confirmation checkbox */}
              <TouchableOpacity
                style={[
                  styles.checkboxRow,
                  {
                    backgroundColor: isDarkMode ? '#0C1A2E' : '#F0F9FF',
                    borderColor: faceWarningChecked ? FACE_ACCENT : '#BAE6FD',
                  },
                ]}
                onPress={() => setFaceWarningChecked(p => !p)}
                activeOpacity={0.75}
                disabled={faceAnalyzing}>
                <View
                  style={[
                    styles.checkbox,
                    faceWarningChecked
                      ? {
                          backgroundColor: FACE_ACCENT,
                          borderColor: FACE_ACCENT,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: '#94A3B8',
                        },
                  ]}>
                  {faceWarningChecked && (
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: normalize(12),
                        fontWeight: '800',
                        lineHeight: normalize(16),
                      }}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: TEXT }]}>
                  I confirm my photo is{' '}
                  <Text style={{ fontWeight: '700' }}>real and live-captured</Text>{' '}
                  in{' '}
                  <Text style={{ fontWeight: '700' }}>proper lighting.</Text>
                </Text>
              </TouchableOpacity>

              {/* Open camera button */}
              <TouchableOpacity
                style={[styles.openCameraBtn, { borderColor: FACE_ACCENT }]}
                onPress={() => {
                  setShowFaceFlow(false);
                  setShowCamera(true);
                }}
                activeOpacity={0.8}
                disabled={faceAnalyzing}>
                <Text style={{ fontSize: 18, marginRight: normalize(8) }}>
                  📷
                </Text>
                <Text
                  style={[styles.openCameraBtnText, { color: FACE_ACCENT }]}>
                  {faceImage ? 'Retake with Camera' : 'Open Camera'}
                </Text>
              </TouchableOpacity>

              {/* Submit row */}
              <View style={[styles.editActions, { marginTop: normalize(12) }]}>
                <TouchableOpacity
                  style={[
                    styles.btnOutline,
                    { borderColor: BORDER, flex: 0.9 },
                  ]}
                  onPress={closeFaceFlow}
                  disabled={faceAnalyzing}>
                  <Text style={[styles.btnOutlineText, { color: MUTED }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btnFill,
                    {
                      flex: 1.1,
                      backgroundColor:
                        faceImage && faceWarningChecked && !faceAnalyzing
                          ? FACE_ACCENT
                          : '#CBD5E1',
                    },
                  ]}
                  onPress={handleRegisterFace}
                  disabled={!faceImage || !faceWarningChecked || faceAnalyzing}>
                  <Text style={styles.btnFillText}>Register Face</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* ── Analyzing Overlay ─────────────────────────────────────────
                Sits inside modalBox so it clips to the rounded corners.
                Visible only while the registerFace API is in-flight.
            ────────────────────────────────────────────────────────────── */}
            {faceAnalyzing && (
              <View style={styles.analyzingOverlay}>
                {/* Scan frame with corner brackets */}
                <View style={styles.scanFrame}>
                  <View style={[styles.scanCorner, styles.scanTL]} />
                  <View style={[styles.scanCorner, styles.scanTR]} />
                  <View style={[styles.scanCorner, styles.scanBL]} />
                  <View style={[styles.scanCorner, styles.scanBR]} />
                  <Animated.View
                    style={[styles.scanLine, { top: scanAnim }]}
                  />
                  <Text style={{ fontSize: normalize(38) }}>🫠</Text>
                </View>

                {/* Elapsed timer */}
                <View style={styles.timerPill}>
                  <Text style={styles.timerText}>
                    ⏱ {formatElapsed(analyzeElapsed)}
                  </Text>
                </View>

                {/* Bouncing dots */}
                <View style={styles.analyzingDots}>
                  {dotAnims.map((anim, i) => (
                    <Animated.View
                      key={i}
                      style={[styles.analyzingDot, { opacity: anim }]}
                    />
                  ))}
                </View>

                <Text style={styles.analyzingLabel}>Analyzing photo…</Text>
                <Text style={styles.analyzingSubLabel}>
                  Please wait while we verify your face
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          Reset Password Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        animationType="fade"
        transparent
        visible={showResetPasswordModal}
        onRequestClose={closeResetPasswordModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: CARD }]}>
            <View style={[styles.modalTop, { backgroundColor: ACCENT }]}>
              <Text style={styles.modalTopTitle}>Reset Password</Text>
              <TouchableOpacity
                onPress={closeResetPasswordModal}
                style={styles.modalCloseBtn}>
                <Text
                  style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: normalize(20) }}>
              {[
                {
                  label: 'New Password',
                  placeholder: 'At least 6 characters',
                  value: password,
                  onChange: setPassword,
                },
                {
                  label: 'Confirm Password',
                  placeholder: 'Repeat new password',
                  value: confirmPassword,
                  onChange: setConfirmPassword,
                },
              ].map((f, i) => (
                <TextInputWithButton
                  key={i}
                  show
                  icon
                  height={normalize(48)}
                  inputWidth={'100%'}
                  marginTop={normalize(i === 0 ? 8 : 16)}
                  textColor={Colors.textInputColor}
                  InputHeaderText={f.label}
                  placeholder={f.placeholder}
                  placeholderTextColor={'#64748B'}
                  paddingLeft={normalize(16)}
                  borderColor={'#E2E8F0'}
                  borderRadius={normalize(10)}
                  editable
                  fontFamily={Fonts.MulishRegular}
                  isheadertext
                  value={f.value}
                  fontSize={normalize(14)}
                  headertxtsize={normalize(12)}
                  onChangeText={e => f.onChange(e)}
                  tintColor={ACCENT}
                  secureTextEntry
                />
              ))}
              <View style={[styles.editActions, { marginTop: normalize(24) }]}>
                <TouchableOpacity
                  style={[styles.btnOutline, { borderColor: '#E2E8F0' }]}
                  onPress={closeResetPasswordModal}>
                  <Text style={[styles.btnOutlineText, { color: '#64748B' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnFill, { backgroundColor: ACCENT }]}
                  onPress={handleResetPassword}>
                  <Text style={styles.btnFillText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, TEXT, MUTED, ACCENT, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <View style={[styles.infoIconBox, { backgroundColor: ACCENT + '18' }]}>
      <Icon name={icon} size={15} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: MUTED }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: TEXT }]} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  </View>
);

const ActionButton = ({ label, emoji, bg, onPress }) => (
  <TouchableOpacity
    style={[styles.actionBtn, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={0.82}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  heroBanner: {
    alignItems: 'center',
    paddingTop: normalize(36),
    paddingBottom: normalize(36),
    overflow: 'hidden',
    position: 'relative',
  },
  decCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -40,
  },
  decCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -20,
    left: -20,
  },
  avatarWrapper: { position: 'relative', marginBottom: normalize(14) },
  avatarImage: {
    width: normalize(96),
    height: normalize(96),
    borderRadius: normalize(48),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarPlaceholder: {
    width: normalize(96),
    height: normalize(96),
    borderRadius: normalize(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: { fontSize: normalize(34), fontWeight: '800', color: '#fff' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0EA5E9',
    borderRadius: normalize(16),
    padding: normalize(6),
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  heroName: {
    fontSize: normalize(22),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: normalize(10),
    gap: normalize(8),
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: normalize(16),
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(4),
  },
  badgeText: { color: '#fff', fontSize: normalize(11), fontWeight: '600' },

  card: {
    marginHorizontal: normalize(16),
    marginTop: normalize(14),
    borderRadius: normalize(16),
    borderWidth: 1,
    padding: normalize(18),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: { fontSize: normalize(16), fontWeight: '700' },
  cardSubtitle: { fontSize: normalize(12), marginTop: normalize(3) },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardRowTitle: { fontSize: normalize(14), fontWeight: '600' },
  cardRowSub: { fontSize: normalize(11), marginTop: 2 },
  iconBox: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(10),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: normalize(14),
  },

  faceCardHeader: { flexDirection: 'row', alignItems: 'center' },
  faceIconCircle: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    gap: normalize(5),
  },
  faceStatusDot: { width: 7, height: 7, borderRadius: 4 },
  faceStatusText: { fontSize: normalize(11), fontWeight: '700' },
  faceInfoList: { gap: normalize(8), marginBottom: normalize(16) },
  faceInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(8),
  },
  faceInfoText: { fontSize: normalize(12), flex: 1, lineHeight: normalize(18) },

  faceModalHint: {
    fontSize: normalize(12),
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(10),
    borderWidth: 1,
    borderRadius: normalize(10),
    borderStyle: 'dashed',
    marginBottom: normalize(14),
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(12),
    marginBottom: normalize(16),
    padding: normalize(14),
    borderRadius: normalize(12),
    borderWidth: 1.5,
  },
  checkbox: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(6),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(1),
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: normalize(12),
    lineHeight: normalize(19),
    flex: 1,
  },

  previewThumbBox: {
    borderRadius: normalize(16),
    overflow: 'hidden',
    height: normalize(180),
    marginBottom: normalize(14),
    position: 'relative',
  },
  previewThumb: { width: '100%', height: '100%' },
  previewThumbBadge: {
    position: 'absolute',
    bottom: normalize(10),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(5),
  },
  previewThumbDot: { width: 8, height: 8, borderRadius: 4 },
  previewThumbText: {
    color: '#fff',
    fontSize: normalize(11),
    fontWeight: '700',
  },

  emptyPreview: {
    height: normalize(130),
    borderRadius: normalize(16),
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(14),
    gap: normalize(6),
  },
  emptyPreviewText: { fontSize: normalize(12), fontWeight: '600' },

  openCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(12),
    paddingVertical: normalize(13),
    borderWidth: 2,
    marginBottom: normalize(4),
  },
  openCameraBtnText: { fontSize: normalize(14), fontWeight: '700' },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(11),
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIconBox: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  infoLabel: { fontSize: normalize(11), fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: normalize(14), fontWeight: '600' },

  editActions: { flexDirection: 'row', gap: normalize(10) },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: normalize(10),
    paddingVertical: normalize(13),
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: normalize(14), fontWeight: '700' },
  btnFill: {
    flex: 1,
    borderRadius: normalize(10),
    paddingVertical: normalize(13),
    alignItems: 'center',
  },
  btnFillText: { color: '#fff', fontSize: normalize(14), fontWeight: '700' },

  actionsGroup: {
    marginHorizontal: normalize(16),
    marginTop: normalize(14),
    gap: normalize(10),
    paddingBottom: normalize(100),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(14),
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(20),
  },
  actionEmoji: { fontSize: 18, marginRight: normalize(12) },
  actionLabel: { color: '#fff', fontSize: normalize(15), fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '92%',
    maxWidth: 440,
    borderRadius: normalize(18),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
  },
  modalTopTitle: { color: '#fff', fontSize: normalize(17), fontWeight: '800' },
  modalCloseBtn: { padding: normalize(4) },

  // ── Analyzing overlay ────────────────────────────────────────────────────
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: normalize(12),
    zIndex: 99,
  },
  scanFrame: {
    width: normalize(100),
    height: normalize(100),
    borderWidth: 1.5,
    borderColor: 'rgba(14,165,233,0.4)',
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scanCorner: {
    position: 'absolute',
    width: normalize(14),
    height: normalize(14),
    borderColor: '#0EA5E9',
    borderStyle: 'solid',
  },
  scanTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: normalize(4),
  },
  scanTR: {
    top: -1,
    right: -1,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: normalize(4),
  },
  scanBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: normalize(4),
  },
  scanBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: normalize(4),
  },
  scanLine: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: '#0EA5E9',
    opacity: 0.9,
    borderRadius: 1,
  },
  timerPill: {
    backgroundColor: 'rgba(14,165,233,0.18)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(5),
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.35)',
  },
  timerText: {
    color: '#7DD3FC',
    fontSize: normalize(13),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  analyzingDots: {
    flexDirection: 'row',
    gap: normalize(6),
  },
  analyzingDot: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(4),
    backgroundColor: '#0EA5E9',
  },
  analyzingLabel: {
    color: '#E2E8F0',
    fontSize: normalize(14),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  analyzingSubLabel: {
    color: '#94A3B8',
    fontSize: normalize(11),
    fontWeight: '500',
  },
});

export default MyProfile;