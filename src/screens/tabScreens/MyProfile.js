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
  Switch,
  StatusBar,
} from 'react-native';
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
import { useAppTheme } from '../../themes/ThemeContext';

let status = '';

// ── Minimal inline icon components (no extra deps) ───────────────────────────
const Icon = ({ name, size = 18, color = '#fff' }) => {
  const icons = {
    user: '👤',
    mail: '✉️',
    phone: '📞',
    gender: '⚧',
    building: '🏢',
    badge: '🪪',
    edit: '✏️',
    lock: '🔒',
    logout: '🚪',
    sun: '☀️',
    moon: '🌙',
    camera: '📷',
    check: '✓',
    close: '✕',
  };
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4 }}>{icons[name] || '•'}</Text>
  );
};

const MyProfile = props => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const { isDarkMode, toggleTheme, colors } = useAppTheme();

  const userDetails = ProfileReducer?.userDetailsResponse || {};

  const [firstName, setFirstName] = useState(userDetails?.first_name || '');
  const [lastName, setLastName] = useState(userDetails?.last_name || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(
    userDetails?.profile_pic_url || null,
  );
  const [phone] = useState(userDetails?.phone || '');
  const [gender] = useState(userDetails?.gender || '');
  const [employeeCode] = useState(userDetails?.employee_code || '');
  const [workLocation] = useState(userDetails?.work_location || '');

  const [isEditing, setIsEditing] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // local copies for derived display
  const [localFirstName, setLocalFirstName] = useState('');
  const [localLastName, setLocalLastName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localGender, setLocalGender] = useState('');
  const [localEmployeeCode, setLocalEmployeeCode] = useState('');
  const [localWorkLocation, setLocalWorkLocation] = useState('');

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
      setCapturedImageWithGeotag(d?.profile_pic_url || null);
    }
  }, [ProfileReducer?.userDetailsResponse]);

  useEffect(() => {
    if (props?.route?.params?.finalImageUri) {
      setCapturedImageWithGeotag(props.route.params.finalImageUri);
      props?.navigation.setParams({ finalImageUri: undefined });
    }
  }, [props?.route?.params?.finalImageUri]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    const d = ProfileReducer?.userDetailsResponse || {};
    setFirstName(d?.first_name || '');
    setLastName(d?.last_name || '');
    setEmail(d?.email || '');
    setCapturedImageWithGeotag(d?.profile_pic_url || null);
  };

  const handleClickPhoto = () => {
    props?.navigation.navigate('Attendence', { pagename: 'MyProfile' });
  };

  function onUpdateProfile() {
    if (!firstName.trim()) { showErrorAlert('First name is required'); return; }
    if (!lastName.trim()) { showErrorAlert('Last name is required'); return; }
    if (!email.trim()) { showErrorAlert('Email is required'); return; }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);

    if (capturedImageWithGeotag && !capturedImageWithGeotag.startsWith('http')) {
      const imageName = capturedImageWithGeotag.split('/').pop();
      formData.append('profile_pic', {
        uri: Platform.OS === 'android'
          ? capturedImageWithGeotag
          : capturedImageWithGeotag.replace('file://', ''),
        name: imageName,
        type: 'image/jpeg',
      });
    }

    connectionrequest()
      .then(() => dispatch(profileUpdateRequest(formData)))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

  function getuserDetails() {
    connectionrequest()
      .then(() => dispatch(userDetailsRequest()))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

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
    if (password.length < 6) { showErrorAlert('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { showErrorAlert('Passwords do not match'); return; }
    const obj = {
      id: ProfileReducer?.userDetailsResponse?.id,
      new_password: password,
      confirm_password: confirmPassword,
    };
    connectionrequest()
      .then(() => { dispatch(resetPasswordRequest(obj)); closeResetPasswordModal(); })
      .catch(() => showErrorAlert('Please connect to internet'));
  };

  if (status === '' || ProfileReducer.status !== status) {
    switch (ProfileReducer.status) {
      case 'Profile/userDetailsRequest':
        status = ProfileReducer.status; setLoading(true); break;
      case 'Profile/userDetailsSuccess':
        status = ProfileReducer.status; setLoading(false); break;
      case 'Profile/userDetailsFailure':
        status = ProfileReducer.status; setLoading(false); break;
      case 'Profile/profileUpdateRequest':
        status = ProfileReducer.status; setLoading(true); break;
      case 'Profile/profileUpdateSuccess':
        status = ProfileReducer.status; setLoading(false); setIsEditing(false); getuserDetails(); break;
      case 'Profile/profileUpdateFailure':
        status = ProfileReducer.status; setLoading(false); setIsEditing(false); break;
    }
  }

  const fullName = [localFirstName || firstName, localLastName || lastName].filter(Boolean).join(' ') || 'User Name';
  const initials = [localFirstName || firstName, localLastName || lastName]
    .filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'U';

  const BG = isDarkMode ? '#0F172A' : '#F8FAFC';
  const CARD = isDarkMode ? '#1E293B' : '#FFFFFF';
  const TEXT = isDarkMode ? '#F1F5F9' : '#1E293B';
  const MUTED = isDarkMode ? '#94A3B8' : '#64748B';
  const BORDER = isDarkMode ? '#334155' : '#E2E8F0';
  const ACCENT = '#6366F1'; // indigo

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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(40) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View style={[styles.heroBanner, { backgroundColor: ACCENT }]}>
          {/* Decorative circles */}
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          {/* Avatar */}
          <TouchableOpacity
            onPress={isEditing ? handleClickPhoto : null}
            disabled={!isEditing}
            activeOpacity={0.85}
            style={styles.avatarWrapper}
          >
            {capturedImageWithGeotag ? (
              <Image
                source={{ uri: capturedImageWithGeotag }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#818CF8' }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Icon name="camera" size={20} color="#fff" />
              </View>
            )}
            {/* Status dot */}
            <View style={styles.statusDot} />
          </TouchableOpacity>

          <Text style={styles.heroName}>{fullName}</Text>
          <View style={styles.badgeRow}>
            {localEmployeeCode ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{localEmployeeCode}</Text>
              </View>
            ) : null}
            {localGender ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={styles.badgeText}>{localGender.charAt(0).toUpperCase() + localGender.slice(1)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Theme Toggle Card ── */}
        {!isEditing && <View style={[styles.card, { backgroundColor: CARD, borderColor: BORDER, marginTop: normalize(16) }]}>
          <View style={styles.cardRow}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 18 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: normalize(12) }}>
              <Text style={[styles.cardRowTitle, { color: TEXT }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.cardRowSub, { color: MUTED }]}>Tap to switch appearance</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={isDarkMode ? ACCENT : '#fff'}
            />
          </View>
        </View>}

        {/* ── Info Card / Edit Card ── */}
        {isEditing ? (
          <View style={[styles.card, { backgroundColor: CARD, borderColor: BORDER }]}>
            <Text style={[styles.cardTitle, { color: TEXT }]}>Edit Profile</Text>
            <Text style={[styles.cardSubtitle, { color: MUTED }]}>Update your name, email or photo</Text>

            <View style={styles.divider} />

            <TextInputWithButton
              show icon
              height={normalize(48)}
              inputWidth={'100%'}
              marginTop={normalize(16)}
              textColor={Colors.textInputColor}
              InputHeaderText={'First Name *'}
              placeholder={'Enter first name'}
              placeholderTextColor={MUTED}
              paddingLeft={normalize(16)}
              borderColor={BORDER}
              borderRadius={normalize(10)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={firstName}
              fontSize={normalize(14)}
              headertxtsize={normalize(12)}
              onChangeText={e => setFirstName(e)}
              tintColor={ACCENT}
            />
            <TextInputWithButton
              show icon
              height={normalize(48)}
              inputWidth={'100%'}
              marginTop={normalize(16)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Last Name *'}
              placeholder={'Enter last name'}
              placeholderTextColor={MUTED}
              paddingLeft={normalize(16)}
              borderColor={BORDER}
              borderRadius={normalize(10)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={lastName}
              fontSize={normalize(14)}
              headertxtsize={normalize(12)}
              onChangeText={e => setLastName(e)}
              tintColor={ACCENT}
            />
            <TextInputWithButton
              show icon
              height={normalize(48)}
              inputWidth={'100%'}
              marginTop={normalize(16)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Email *'}
              placeholder={'Enter email'}
              placeholderTextColor={MUTED}
              paddingLeft={normalize(16)}
              borderColor={BORDER}
              borderRadius={normalize(10)}
              editable
              fontFamily={Fonts.MulishRegular}
              isheadertext
              value={email}
              fontSize={normalize(14)}
              headertxtsize={normalize(12)}
              onChangeText={e => setEmail(e)}
              tintColor={ACCENT}
              keyboardType="email-address"
            />

            <View style={[styles.divider, { marginTop: normalize(20) }]} />

            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.btnOutline, { borderColor: '#EF4444' }]} onPress={handleCancel}>
                <Text style={[styles.btnOutlineText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnFill, { backgroundColor: ACCENT }]} onPress={onUpdateProfile}>
                <Text style={styles.btnFillText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: CARD, borderColor: BORDER }]}>
            <Text style={[styles.cardTitle, { color: TEXT }]}>Personal Information</Text>
            <Text style={[styles.cardSubtitle, { color: MUTED }]}>Your account details</Text>
            <View style={styles.divider} />

            <InfoRow icon="user" label="First Name" value={localFirstName} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="user" label="Last Name" value={localLastName} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="mail" label="Email" value={localEmail} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="phone" label="Phone" value={localPhone} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="gender" label="Gender" value={localGender ? localGender.charAt(0).toUpperCase() + localGender.slice(1) : ''} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="badge" label="Employee Code" value={localEmployeeCode} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} />
            <InfoRow icon="building" label="Work Location" value={localWorkLocation} TEXT={TEXT} MUTED={MUTED} ACCENT={ACCENT} last />
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

      {/* ── Reset Password Modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={showResetPasswordModal}
        onRequestClose={closeResetPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: CARD }]}>
            {/* Header */}
            <View style={[styles.modalTop, { backgroundColor: ACCENT }]}>
              <Text style={styles.modalTopTitle}>Reset Password</Text>
              <TouchableOpacity onPress={closeResetPasswordModal} style={styles.modalCloseBtn}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: normalize(20) }}>
              <TextInputWithButton
                show icon
                height={normalize(48)}
                inputWidth={'100%'}
                marginTop={normalize(8)}
                textColor={Colors.textInputColor}
                InputHeaderText={'New Password'}
                placeholder={'At least 6 characters'}
                placeholderTextColor={MUTED}
                paddingLeft={normalize(16)}
                borderColor={BORDER}
                borderRadius={normalize(10)}
                editable
                fontFamily={Fonts.MulishRegular}
                isheadertext
                value={password}
                fontSize={normalize(14)}
                headertxtsize={normalize(12)}
                onChangeText={e => setPassword(e)}
                tintColor={ACCENT}
                secureTextEntry
              />
              <TextInputWithButton
                show icon
                height={normalize(48)}
                inputWidth={'100%'}
                marginTop={normalize(16)}
                textColor={Colors.textInputColor}
                InputHeaderText={'Confirm Password'}
                placeholder={'Repeat new password'}
                placeholderTextColor={MUTED}
                paddingLeft={normalize(16)}
                borderColor={BORDER}
                borderRadius={normalize(10)}
                editable
                fontFamily={Fonts.MulishRegular}
                isheadertext
                value={confirmPassword}
                fontSize={normalize(14)}
                headertxtsize={normalize(12)}
                onChangeText={e => setConfirmPassword(e)}
                tintColor={ACCENT}
                secureTextEntry
              />

              <View style={[styles.editActions, { marginTop: normalize(24) }]}>
                <TouchableOpacity style={[styles.btnOutline, { borderColor: BORDER }]} onPress={closeResetPasswordModal}>
                  <Text style={[styles.btnOutlineText, { color: MUTED }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnFill, { backgroundColor: ACCENT }]} onPress={handleResetPassword}>
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
      <Icon name={icon} size={15} color={ACCENT} />
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
    activeOpacity={0.82}
  >
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Hero
  heroBanner: {
    alignItems: 'center',
    paddingTop: normalize(36),
    paddingBottom: normalize(36),
    overflow: 'hidden',
    position: 'relative',
  },
  decCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -40,
  },
  decCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)', bottom: -20, left: -20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: normalize(14),
  },
  avatarImage: {
    width: normalize(96), height: normalize(96),
    borderRadius: normalize(48),
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarPlaceholder: {
    width: normalize(96), height: normalize(96),
    borderRadius: normalize(48),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: {
    fontSize: normalize(34), fontWeight: '800', color: '#fff',
  },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#4F46E5', borderRadius: normalize(16),
    padding: normalize(6), borderWidth: 2, borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute', bottom: 4, right: 0,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#22C55E', borderWidth: 2.5, borderColor: '#fff',
  },
  heroName: {
    fontSize: normalize(22), fontWeight: '800', color: '#fff',
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row', marginTop: normalize(10), gap: normalize(8),
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(12), paddingVertical: normalize(4),
  },
  badgeText: {
    color: '#fff', fontSize: normalize(12), fontWeight: '600',
  },

  // Cards
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
  cardTitle: {
    fontSize: normalize(16), fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: normalize(12), marginTop: normalize(3),
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  cardRowTitle: {
    fontSize: normalize(14), fontWeight: '600',
  },
  cardRowSub: {
    fontSize: normalize(11), marginTop: 2,
  },
  iconBox: {
    width: normalize(38), height: normalize(38), borderRadius: normalize(10),
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  divider: {
    height: 1, backgroundColor: '#E2E8F0', marginVertical: normalize(14),
  },

  // Info rows
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: normalize(11),
  },
  infoRowBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  infoIconBox: {
    width: normalize(32), height: normalize(32), borderRadius: normalize(8),
    justifyContent: 'center', alignItems: 'center',
    marginRight: normalize(12),
  },
  infoLabel: {
    fontSize: normalize(11), fontWeight: '500', marginBottom: 2,
  },
  infoValue: {
    fontSize: normalize(14), fontWeight: '600',
  },

  // Edit actions
  editActions: {
    flexDirection: 'row', gap: normalize(10),
  },
  btnOutline: {
    flex: 1, borderWidth: 1.5, borderRadius: normalize(10),
    paddingVertical: normalize(13), alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: normalize(14), fontWeight: '700',
  },
  btnFill: {
    flex: 1, borderRadius: normalize(10),
    paddingVertical: normalize(13), alignItems: 'center',
  },
  btnFillText: {
    color: '#fff', fontSize: normalize(14), fontWeight: '700',
  },

  // Action buttons
  actionsGroup: {
    marginHorizontal: normalize(16),
    marginTop: normalize(14),
    gap: normalize(10),
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: normalize(14),
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(20),
  },
  actionEmoji: {
    fontSize: 18, marginRight: normalize(12),
  },
  actionLabel: {
    color: '#fff', fontSize: normalize(15), fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    width: '90%', maxWidth: 420, borderRadius: normalize(18),
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  modalTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: normalize(20), paddingVertical: normalize(16),
  },
  modalTopTitle: {
    color: '#fff', fontSize: normalize(17), fontWeight: '800',
  },
  modalCloseBtn: {
    padding: normalize(4),
  },
});

export default MyProfile;