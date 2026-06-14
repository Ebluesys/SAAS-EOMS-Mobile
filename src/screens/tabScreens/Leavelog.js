import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { Colors, Fonts } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import normalize from '../../utils/helpers/normalize';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import {
  leaveCancelRequest,
  leaveLogRequest,
  remainingLeavesRequest,
} from '../../redux/reducer/ProfileReducer';

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    accent: '#EF9F27',
    bg: '#FAEEDA',
    text: '#854F0B',
    border: '#EF9F2766',
    label: 'Pending',
  },
  approved: {
    accent: '#639922',
    bg: '#EAF3DE',
    text: '#3B6D11',
    border: '#63992266',
    label: 'Approved',
  },
  rejected: {
    accent: '#E24B4A',
    bg: '#FCEBEB',
    text: '#A32D2D',
    border: '#E24B4A66',
    label: 'Rejected',
  },
  cancelled: {
    accent: '#888780',
    bg: '#F1EFE8',
    text: '#5F5E5A',
    border: '#88878066',
    label: 'Cancelled',
  },
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

const progressColor = remaining => {
  if (remaining === 0) return '#E24B4A';
  if (remaining <= 1) return '#EF9F27';
  return '#378ADD';
};

const fmtDate = date => moment(date).format('DD MMM');

// ─── Leave Balance Card ─────────────────────────────────────────────────────
const BalanceCard = ({ item }) => {
  const pct = item.total_leaves > 0
    ? (item.used_leaves / item.total_leaves) * 100
    : 0;
  const barColor = progressColor(item.remaining_leaves);

  return (
    <View style={styles.balanceCard}>
      {/* Top accent stripe */}
      <View style={[styles.balanceAccent, { backgroundColor: barColor }]} />

      <View style={styles.balanceCardInner}>
        <Text style={styles.balanceCardTitle} numberOfLines={1}>
          {item.leave_type_name}
        </Text>

        <View style={styles.balanceNums}>
          <Text style={styles.balanceBig}>{item.remaining_leaves}</Text>
          <Text style={styles.balanceOf}>of {item.total_leaves}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progTrack}>
          <View
            style={[
              styles.progFill,
              { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor },
            ]}
          />
        </View>

        <View style={styles.balanceStatRow}>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatVal}>{item.total_leaves}</Text>
            <Text style={styles.balanceStatLbl}>Total</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatVal}>{item.used_leaves}</Text>
            <Text style={styles.balanceStatLbl}>Used</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceStat}>
            <Text style={[styles.balanceStatVal, { color: barColor }]}>
              {item.remaining_leaves}
            </Text>
            <Text style={styles.balanceStatLbl}>Left</Text>
          </View>
        </View>
      </View>

      {/* 3-D shadow layer */}
      <View style={styles.balanceCardShadow} />
    </View>
  );
};

// ─── Leave History Card ─────────────────────────────────────────────────────
const LeaveCard = ({ item, onCancel }) => {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.cancelled;
  const days = parseFloat(item.days);
  const daysLabel =
    days === 0.5 ? 'Half day' : `${days} day${days !== 1 ? 's' : ''}`;
  const startFmt = fmtDate(item.start_date);
  const endFmt = fmtDate(item.end_date);
  const dateRange = startFmt === endFmt
    ? startFmt
    : `${startFmt} – ${endFmt}`;

  return (
    <View style={styles.leaveCardWrapper}>
      {/* 3-D offset shadow */}
      <View style={[styles.leaveCardShadow, { backgroundColor: '#2C2C2A' }]} />

      <View style={styles.leaveCard}>
        {/* Top accent bar */}
        <View style={[styles.cardAccentBar, { backgroundColor: cfg.accent }]} />

        <View style={styles.cardInner}>
          {/* Type + status row */}
          <View style={styles.cardTop}>
            <Text style={styles.cardTypeTag} numberOfLines={1}>
              {item.leave_type_name}
            </Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: cfg.bg, borderColor: cfg.border },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: cfg.accent }]} />
              <Text style={[styles.statusPillText, { color: cfg.text }]}>
                {cfg.label}
              </Text>
            </View>
          </View>

          {/* Reason */}
          <Text style={styles.cardReason} numberOfLines={2}>
            {item.reason}
          </Text>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Meta row */}
          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>📅 {dateRange}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                🕐 {fmtDate(item.created_at ?? item.applied_at)}
              </Text>
            </View>
            <View style={[styles.metaChip, styles.daysPill]}>
              <Text style={styles.daysPillText}>{daysLabel}</Text>
            </View>
          </View>

          {/* Reject reason */}
          {item.status === 'rejected' && !!item.leaves_status && (
            <View style={styles.rejectReasonBox}>
              <Text style={styles.rejectReasonLabel}>Reason for rejection</Text>
              <Text style={styles.rejectReasonText}>{item.leaves_status}</Text>
            </View>
          )}

          {/* Cancel button — pending only */}
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  'Cancel leave request',
                  'Are you sure you want to cancel this request?',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes, cancel',
                      style: 'destructive',
                      onPress: () => onCancel(item.id),
                    },
                  ],
                );
              }}
            >
              <Text style={styles.cancelBtnText}>✕  Cancel request</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
let status = '';

const Leavelog = ({ navigation }) => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();

  const [leavelogList, setLeavelogList] = useState([]);
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredList =
    activeFilter === 'All'
      ? leavelogList
      : leavelogList.filter(l => l.status === activeFilter.toLowerCase());

  const handleCancel = id => {
    connectionrequest()
      .then(() => dispatch(leaveCancelRequest(id)))
      .catch(() => showErrorAlert('Please connect to internet'));
  };

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(remainingLeavesRequest(ProfileReducer?.userDetailsResponse?.id));
          dispatch(leaveLogRequest());
        })
        .catch(() => showErrorAlert('Please connect to internet'));
    }
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.leaveLogResponse?.length > 0) {
      setLeavelogList(ProfileReducer.leaveLogResponse);
    }
  }, [ProfileReducer?.leaveLogResponse]);

  useEffect(() => {
    if (ProfileReducer?.remainingLeavesResponse?.leaves?.length > 0) {
      setRemainingLeaves(ProfileReducer.remainingLeavesResponse.leaves);
    }
  }, [ProfileReducer?.remainingLeavesResponse]);

  if (status === '' || ProfileReducer.status !== status) {
    switch (ProfileReducer.status) {
      case 'Profile/leaveLogRequest':
      case 'Profile/leaveLogSuccess':
      case 'Profile/leaveLogFailure':
      case 'Profile/leaveCancelRequest':
      case 'Profile/leaveCancelFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveCancelSuccess':
        status = ProfileReducer.status;
        connectionrequest()
          .then(() => dispatch(leaveLogRequest()))
          .catch(() => showErrorAlert('Please connect to internet'));
        break;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <Loader
        visible={
          ProfileReducer?.status === 'Profile/leaveCancelRequest' ||
          ProfileReducer?.status === 'Profile/leaveLogRequest'
        }
      />

      <FlatList
        data={filteredList}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <LeaveCard item={item} onCancel={handleCancel} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗓</Text>
            <Text style={styles.emptyTitle}>
              No {activeFilter.toLowerCase()} leaves
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'All'
                ? 'Your leave history will appear here.'
                : `No ${activeFilter.toLowerCase()} requests found.`}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <>
            {/* ── Balance ── */}
            {remainingLeaves.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Leave balance</Text>
                <FlatList
                  data={remainingLeaves}
                  keyExtractor={item => String(item.leave_type_id)}
                  renderItem={({ item }) => <BalanceCard item={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.balanceList}
                  ItemSeparatorComponent={() => (
                    <View style={{ width: normalize(12) }} />
                  )}
                />
              </View>
            )}

            {/* ── Filter chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, activeFilter === f && styles.chipActive]}
                  activeOpacity={0.75}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeFilter === f && styles.chipTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text
              style={[
                styles.sectionLabel,
                { paddingHorizontal: 16, paddingBottom: 10 },
              ]}
            >
              History
            </Text>
          </>
        }
      />
    </View>
  );
};

export default Leavelog;

// ─── Styles ──────────────────────────────────────────────────────────────────
const DARK = '#2C2C2A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EEE8',
  },
  listContent: {
    paddingBottom: normalize(100),
  },

  // ── Section ──
  section: {
    paddingTop: normalize(16),
    paddingBottom: normalize(4),
  },
  sectionLabel: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishBold,
    color: '#888780',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: normalize(10),
  },

  // ── Balance card ──
  balanceList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  balanceCardWrapper: {
    position: 'relative',
  },
  balanceCard: {
    width: normalize(155),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(14),
    borderWidth: 1.5,
    borderColor: DARK,
    overflow: 'hidden',
    // 3-D shadow via elevation + manual offset
    shadowColor: DARK,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  balanceAccent: {
    height: normalize(4),
    width: '100%',
  },
  balanceCardInner: {
    padding: normalize(12),
  },
  balanceCardTitle: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishSemiBold,
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalize(6),
  },
  balanceNums: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: normalize(8),
  },
  balanceBig: {
    fontSize: normalize(28),
    fontFamily: Fonts.MulishBold,
    color: DARK,
    lineHeight: normalize(32),
  },
  balanceOf: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishRegular,
    color: '#B4B2A9',
    marginBottom: normalize(4),
  },
  progTrack: {
    height: normalize(5),
    backgroundColor: '#F0EEE8',
    borderRadius: normalize(99),
    overflow: 'hidden',
    marginBottom: normalize(10),
    borderWidth: 0.5,
    borderColor: '#2C2C2A22',
  },
  progFill: {
    height: '100%',
    borderRadius: normalize(99),
  },
  balanceStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  balanceDivider: {
    width: 0.5,
    height: normalize(24),
    backgroundColor: '#2C2C2A22',
  },
  balanceStatVal: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishBold,
    color: DARK,
    marginBottom: normalize(1),
  },
  balanceStatLbl: {
    fontSize: normalize(9),
    fontFamily: Fonts.MulishRegular,
    color: '#B4B2A9',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  balanceCardShadow: {
    // handled by shadowOffset on the card itself (iOS)
  },

  // ── Filter chips ──
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: normalize(12),
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: normalize(99),
    borderWidth: 1.5,
    borderColor: DARK,
    backgroundColor: '#FFFFFF',
    // 3-D offset
    shadowColor: DARK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: DARK,
    shadowColor: DARK,
    shadowOpacity: 1,
  },
  chipText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishSemiBold,
    color: '#5F5E5A',
  },
  chipTextActive: {
    color: '#F0EEE8',
  },

  // ── Leave card ──
  leaveCardWrapper: {
    marginHorizontal: 16,
    marginBottom: normalize(14),
    position: 'relative',
  },
  leaveCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: normalize(14),
    backgroundColor: DARK,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(14),
    borderWidth: 1.5,
    borderColor: DARK,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: normalize(4),
    width: '100%',
  },
  cardInner: {
    padding: normalize(14),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
  },
  cardTypeTag: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishBold,
    color: '#B4B2A9',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(99),
    borderWidth: 1,
  },
  statusDot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(99),
  },
  statusPillText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishBold,
  },
  cardReason: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishSemiBold,
    color: DARK,
    lineHeight: normalize(20),
    marginBottom: normalize(10),
  },
  cardDivider: {
    height: 0.5,
    backgroundColor: '#2C2C2A18',
    marginBottom: normalize(10),
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0EEE8',
    borderRadius: normalize(6),
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(3),
    borderWidth: 0.5,
    borderColor: '#2C2C2A18',
  },
  metaChipText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishRegular,
    color: '#5F5E5A',
  },
  daysPill: {
    marginLeft: 'auto',
    backgroundColor: DARK,
    borderColor: DARK,
  },
  daysPillText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishSemiBold,
    color: '#F0EEE8',
  },

  // ── Reject reason ──
  rejectReasonBox: {
    marginTop: normalize(10),
    backgroundColor: '#FCEBEB',
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#E24B4A44',
    padding: normalize(10),
  },
  rejectReasonLabel: {
    fontSize: normalize(9),
    fontFamily: Fonts.MulishBold,
    color: '#A32D2D',
    marginBottom: normalize(3),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rejectReasonText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishRegular,
    color: '#A32D2D',
  },

  // ── Cancel button ──
  cancelBtn: {
    marginTop: normalize(12),
    borderRadius: normalize(9),
    borderWidth: 1.5,
    borderColor: '#A32D2D',
    paddingVertical: normalize(9),
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    shadowColor: '#A32D2D',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 2,
  },
  cancelBtnText: {
    fontSize: normalize(12),
    fontFamily: Fonts.MulishSemiBold,
    color: '#A32D2D',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: normalize(60),
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: normalize(36),
    marginBottom: normalize(12),
  },
  emptyTitle: {
    fontSize: normalize(15),
    fontFamily: Fonts.MulishBold,
    color: '#5F5E5A',
    marginBottom: normalize(6),
    textTransform: 'capitalize',
  },
  emptySubtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishRegular,
    color: '#B4B2A9',
    textAlign: 'center',
    lineHeight: normalize(19),
  },
});