import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import Header from '../../components/Header';
import Loader from '../../utils/helpers/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import {
  taskListRequest,
  updateTaskRequest,
} from '../../redux/reducer/ProfileReducer';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    desc: 'Not started yet',
    icon: '○',
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#CBD5E1',
  },
  in_progress: {
    label: 'In Progress',
    desc: 'Currently being worked',
    icon: '◑',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#93C5FD',
  },
  paused: {
    label: 'Paused',
    desc: 'Temporarily on hold',
    icon: '⏸',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
  },
  review: {
    label: 'Review',
    desc: 'Awaiting feedback',
    icon: '◎',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#C4B5FD',
  },
  done: {
    label: 'Done',
    desc: 'Completed successfully',
    icon: '✓',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#86EFAC',
  },
  blocked: {
    label: 'Blocked',
    desc: 'Needs unblocking',
    icon: '✕',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
  },
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#B91C1C', bg: '#FEF2F2' },
  high: { label: 'High', color: '#C2410C', bg: '#FFF7ED' },
  medium: { label: 'Medium', color: '#B45309', bg: '#FFFBEB' },
  low: { label: 'Low', color: '#15803D', bg: '#F0FDF4' },
};

const STATUS_ORDER = [
  'todo',
  'in_progress',
  'paused',
  'review',
  'done',
  'blocked',
];
const FILTERS = ['all', ...STATUS_ORDER];
const FILTER_LABELS = {
  all: 'All',
  ...Object.fromEntries(STATUS_ORDER.map(k => [k, STATUS_CONFIG[k].label])),
};

// ─── Status Bottom Sheet ──────────────────────────────────────────────────────

const StatusSheet = ({ visible, task, onSelect, onClose }) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!task) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[ss.overlay, { opacity: fadeAnim }]} />
      </Pressable>
      <Animated.View
        style={[ss.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={ss.handle} />
        <View style={ss.sheetHeader}>
          <View>
            <Text style={ss.sheetTitle}>Change Status</Text>
            <Text style={ss.sheetTask} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          <TouchableOpacity
            style={ss.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={ss.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {STATUS_ORDER.map(key => {
            const cfg = STATUS_CONFIG[key];
            const isActive = task.status === key;
            return (
              <TouchableOpacity
                key={key}
                style={[ss.statusOpt, isActive && { backgroundColor: cfg.bg }]}
                onPress={() => onSelect(task.id, key)}
                activeOpacity={0.7}
              >
                <View style={[ss.optIconWrap, { backgroundColor: cfg.bg }]}>
                  <Text style={[ss.optIcon, { color: cfg.color }]}>
                    {cfg.icon}
                  </Text>
                </View>
                <View style={ss.optInfo}>
                  <Text
                    style={[
                      ss.optName,
                      isActive && { color: cfg.color, fontWeight: '600' },
                    ]}
                  >
                    {cfg.label}
                  </Text>
                  <Text style={ss.optDesc}>{cfg.desc}</Text>
                </View>
                {isActive && (
                  <View style={[ss.checkCircle, { backgroundColor: cfg.bg }]}>
                    <Text style={[ss.checkMark, { color: cfg.color }]}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// Card color themes per status
const CARD_THEME = {
  todo: { accent: '#64748B', tint: '#F1F5F9', shadow: '#CBD5E1' },
  in_progress: { accent: '#2563EB', tint: '#DBEAFE', shadow: '#93C5FD' },
  paused: { accent: '#D97706', tint: '#FEF3C7', shadow: '#FCD34D' },
  review: { accent: '#7C3AED', tint: '#EDE9FE', shadow: '#C4B5FD' },
  done: { accent: '#16A34A', tint: '#DCFCE7', shadow: '#86EFAC' },
  blocked: { accent: '#DC2626', tint: '#FEE2E2', shadow: '#FCA5A5' },
};

// Task Card
const TaskCard = React.memo(({ item, onOpenPicker }) => {
  const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.todo;
  const p = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
  const theme = CARD_THEME[item.status] || CARD_THEME.todo;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const due = item.due_date
    ? new Date(item.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;
  const overdue =
    item.due_date &&
    new Date(item.due_date) < new Date() &&
    item.status !== 'done';

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onOpenPicker(item)}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[cs.cardShadowBot, { backgroundColor: theme.shadow }]} />
        <View
          style={[
            cs.cardShadowMid,
            { backgroundColor: theme.shadow, opacity: 0.5 },
          ]}
        />
        <View style={[cs.card, { borderColor: theme.accent + '55' }]}>
          <View style={[cs.topStrip, { backgroundColor: theme.tint }]}>
            <View style={[cs.accentBar, { backgroundColor: theme.accent }]} />
            <View style={cs.stripContent}>
              <Text
                style={[cs.cardTitle, { color: theme.accent }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View
                style={[
                  cs.priorityPill,
                  { backgroundColor: p.bg, borderColor: p.color + '55' },
                ]}
              >
                <Text style={[cs.priorityText, { color: p.color }]}>
                  {p.label}
                </Text>
              </View>
            </View>
          </View>
          <View style={cs.cardBody}>
            {!!item.description && (
              <Text style={cs.cardDesc} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <View style={cs.cardFooter}>
              <View
                style={[
                  cs.statusBadge,
                  { backgroundColor: s.bg, borderColor: s.border },
                ]}
              >
                <Text style={[cs.statusIcon, { color: s.color }]}>
                  {s.icon}
                </Text>
                <Text style={[cs.statusLabel, { color: s.color }]}>
                  {s.label}
                </Text>
                <Text style={[cs.statusChevron, { color: s.color }]}>⌄</Text>
              </View>
              <View style={cs.metaRow}>
                {item.labels?.slice(0, 2).map(l => (
                  <View
                    key={l}
                    style={[
                      cs.labelChip,
                      {
                        backgroundColor: theme.tint,
                        borderColor: theme.accent + '44',
                      },
                    ]}
                  >
                    <Text style={[cs.labelText, { color: theme.accent }]}>
                      {l}
                    </Text>
                  </View>
                ))}
                {due && (
                  <Text style={[cs.dueText, overdue && cs.dueDateOverdue]}>
                    {overdue ? '⚠ ' : ''}
                    {due}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ tasks }) => {
  const done = tasks.filter(t => t.status === 'done').length;
  const inProg = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <View style={sb.wrap}>
      <View style={sb.statRow}>
        {[
          { num: done, label: 'Done', color: '#16A34A' },
          { num: inProg, label: 'In Progress', color: '#2563EB' },
          { num: blocked, label: 'Blocked', color: '#DC2626' },
          { num: todo, label: 'To Do', color: '#64748B' },
        ].map(({ num, label, color }) => (
          <View key={label} style={sb.statItem}>
            <Text style={[sb.statNum, { color }]}>{num}</Text>
            <Text style={sb.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={sb.progBg}>
        <View style={[sb.progFill, { width: `${pct}%` }]} />
      </View>
      <Text style={sb.progText}>
        {done} of {tasks.length} tasks complete · {pct}%
      </Text>
    </View>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterBar = ({ active, onChange, tasks }) => (
  <View style={fb.wrapper}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={fb.bar}
      keyboardShouldPersistTaps="handled"
    >
      {FILTERS.map(f => {
        const count =
          f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length;
        const isActive = f === active;
        return (
          <TouchableOpacity
            key={f}
            style={[fb.chip, isActive && fb.chipActive]}
            onPress={() => onChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[fb.chipText, isActive && fb.chipTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
            {count > 0 && (
              <View style={[fb.badge, isActive && fb.badgeActive]}>
                <Text style={[fb.badgeText, isActive && fb.badgeTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

let status = '';

const ActiveTask = props => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();

  const [taskList, setTaskList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [pickerTask, setPickerTask] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (isFocused) dispatch(taskListRequest());
  }, [isFocused]);

  const updateTaskStatus = useCallback((taskId, newStatus) => {
    dispatch(updateTaskRequest({ taskId, status: newStatus }));
  }, []);

  const openPicker = useCallback(task => {
    setPickerTask(task);
    setSheetOpen(true);
  }, []);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    console.log(">>>>>>",taskId, newStatus);
    
    setTaskList(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    setSheetOpen(false);
    dispatch(
      updateTaskRequest({
        taskId, // ← taskId in params
        body: { status: newStatus }, // ← status in body (e.g. 'todo', 'in_progress', etc.)
      }),
    );
  }, []);

console.log("Filter:", filter);
console.log("TaskList:", taskList);
console.log("TaskList Length:", taskList?.length);

const filteredTasks =
  filter === 'all'
    ? taskList
    : taskList.filter(t => t.status === filter);

console.log("Filtered Tasks:", filteredTasks);

  const renderItem = useCallback(
    ({ item }) => <TaskCard item={item} onOpenPicker={openPicker} />,
    [openPicker],
  );
  if (status === '' || ProfileReducer.status !== status) {
    switch (ProfileReducer.status) {
      case 'Profile/taskListRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/taskListSuccess':
        status = ProfileReducer.status;
        setTaskList(ProfileReducer?.taskListResponse);
        console.log("Kick TASK==>>>>",ProfileReducer?.taskListResponse);
        
        break;
      case 'Profile/taskListFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/updateTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/updateTaskSuccess':
        status = ProfileReducer.status;
        dispatch(taskListRequest())
        break;
      case 'Profile/updateTaskFailure':
        status = ProfileReducer.status;
        break;
    }
  }
  return (
    <View style={scr.root}>
      <StatusBar barStyle="dark-content" />
      <Header
        HeaderLogo
        Title
        placeText={'My Daily Task'}
        onPress_back_button={() => props.navigation?.goBack()}
      />

      <Loader
        visible={
          ProfileReducer?.status === 'Profile/taskListRequest' ||
          ProfileReducer?.status === 'Profile/updateTaskRequest'
        }
      />

      <StatsBar tasks={taskList} />
      <FilterBar active={filter} onChange={setFilter} tasks={taskList} />

      <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={scr.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={scr.empty}>
            <Text style={scr.emptyIcon}>📋</Text>
            <Text style={scr.emptyTitle}>No tasks here</Text>
            <Text style={scr.emptyBody}>
              {filter === 'all'
                ? 'Tasks assigned to you will appear here'
                : `No tasks with "${FILTER_LABELS[filter]}" status`}
            </Text>
          </View>
        }
      />

      <StatusSheet
        visible={sheetOpen}
        task={pickerTask}
        onSelect={handleStatusChange}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
};

export default ActiveTask;

// ─── Styles ───────────────────────────────────────────────────────────────────

const scr = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

const cs = StyleSheet.create({
  // 3D shadow layers (positioned behind card via margins)
  cardShadowBot: {
    position: 'absolute',
    bottom: -5,
    left: 4,
    right: 4,
    height: '100%',
    borderRadius: 16,
    zIndex: 0,
  },
  cardShadowMid: {
    position: 'absolute',
    bottom: -3,
    left: 2,
    right: 2,
    height: '100%',
    borderRadius: 15,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 2,
    marginBottom: 5,
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 10,
    marginLeft: 0,
  },
  stripContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', marginRight: 8 },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityText: { fontSize: 11, fontWeight: '600' },
  cardBody: { paddingHorizontal: 14, paddingBottom: 12, paddingTop: 6 },
  cardDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusIcon: { fontSize: 12, fontWeight: '700', marginRight: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  statusChevron: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.6,
    marginLeft: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  labelChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 4,
  },
  labelText: { fontSize: 10, fontWeight: '600' },
  dueText: { fontSize: 11, color: '#94A3B8', marginLeft: 4 },
  dueDateOverdue: { color: '#EF4444', fontWeight: '600' },
});

const sb = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  statRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  statItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  progBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progFill: { height: 4, backgroundColor: '#3B82F6', borderRadius: 2 },
  progText: { fontSize: 11, color: '#94A3B8' },
});

const fb = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  chipTextActive: { color: '#2563EB' },
  badge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 5,
  },
  badgeActive: { backgroundColor: '#BFDBFE' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  badgeTextActive: { color: '#1D4ED8' },
});

const ss = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  sheetTask: { fontSize: 12, color: '#94A3B8', marginTop: 2, maxWidth: 240 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  statusOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    marginTop: 2,
  },
  optIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optIcon: { fontSize: 17, fontWeight: '700' },
  optInfo: { flex: 1 },
  optName: { fontSize: 14, fontWeight: '500', color: '#1E293B' },
  optDesc: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 13, fontWeight: '700' },
});
