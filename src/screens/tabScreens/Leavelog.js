import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import TextInputWithButton from '../../components/TextInputWithBotton';
import DatePicker from 'react-native-date-picker';
import normalize from '../../utils/helpers/normalize';
import Modal from 'react-native-modal';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyLeaveRequest,
  leaveCancelRequest,
  leaveLogRequest,
  remainingLeavesRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { useIsFocused } from '@react-navigation/native';
let status = '';
const Leavelog = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [LeavelogList, setLeavelogList] = useState([]);
  const [remainingLeaves, setRemainingLeaves] = useState([]);

  const formatDate = date => {
    return moment(date).format('YYYY-MM-DD');
  };

  function handleCancel(id) {
    connectionrequest()
      .then(() => {
        dispatch(leaveCancelRequest(id));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }

  // Render leave summary card
  const renderLeaveSummaryCard = ({ item }) => (
    <View style={styles.leaveSummaryCard}>
      <View style={styles.leaveTypeHeader}>
        <Text style={styles.leaveTypeName}>{item?.leave_type_name}</Text>
        <View style={styles.leaveBadge}>
          <Text style={styles.leaveBadgeText}>
            {item?.remaining_leaves}/{item?.total_leaves}
          </Text>
        </View>
      </View>

      <View style={styles.leaveProgressContainer}>
        <View style={styles.leaveProgressBar}>
          <View
            style={[
              styles.leaveProgressFill,
              {
                width: `${(item?.used_leaves / item?.total_leaves) * 100}%`,
                backgroundColor:
                  item?.remaining_leaves === 0
                    ? Colors.red
                    : item?.remaining_leaves <= 1
                    ? Colors.orange
                    : Colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.usedLeavesText}>{item?.used_leaves} used</Text>
      </View>

      <View style={styles.leaveStatsRow}>
        <View style={styles.leaveStat}>
          <Text style={styles.leaveStatNumber}>{item?.total_leaves}</Text>
          <Text style={styles.leaveStatLabel}>Total</Text>
        </View>
        <View style={styles.leaveStat}>
          <Text style={styles.leaveStatNumber}>{item?.used_leaves}</Text>
          <Text style={styles.leaveStatLabel}>Used</Text>
        </View>
        <View style={styles.leaveStat}>
          <Text style={[styles.leaveStatNumber, { color: Colors.green }]}>
            {item?.remaining_leaves}
          </Text>
          <Text style={styles.leaveStatLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );

  const renderLeavelog = ({ item, index }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor:
            item?.status === 'pending'
              ? Colors.lightYellow
              : item?.status === 'approved'
              ? Colors.lightgreen
              : Colors.lightred,
        },
      ]}
    >
      <View style={styles.row1}>
        <Text style={styles.lebel}>Leave Status : </Text>
        <Text style={[styles.lebelValue, { textTransform: 'capitalize' }]}>
          {item?.status}
        </Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>Leave Type : </Text>
        <Text style={styles.lebelValue}>{item?.leave_gov_type}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>From : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.start_date)}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>To : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.end_date)}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>Applyed on : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.applied_at)}</Text>
      </View>
      <View style={[styles.row1, { width: '75%', alignItems: 'baseline' }]}>
        <Text style={styles.lebel}>Leave Reason : </Text>
        <Text style={styles.lebelValue}>{item?.reason}</Text>
      </View>
      {item?.status === 'rejected' && (
        <View style={[styles.row1, { width: '75%', alignItems: 'baseline' }]}>
          <Text style={styles.lebel}>Reject Reason : </Text>
          <Text style={styles.lebelValue}>{item?.leaves_status}</Text>
        </View>
      )}
      {item?.status === 'pending' && (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Are you sure', 'You want to cancel ?', [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => {
                  handleCancel(item?.id);
                },
              },
            ]);
          }}
          style={{
            backgroundColor: Colors.red,
            position: 'absolute',
            right: 20,
            top: 15,
            borderRadius: normalize(8),
          }}
        >
          <Text
            style={[
              styles.lebelValue,
              {
                color: Colors.white,
                paddingHorizontal: 30,
                paddingVertical: 10,
              },
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(remainingLeavesRequest(ProfileReducer?.userDetailsResponse?.id));
          dispatch(leaveLogRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.leaveLogResponse?.length > 0) {
      setLeavelogList(ProfileReducer?.leaveLogResponse);
    }
  }, [ProfileReducer?.leaveLogResponse]);

  useEffect(() => {
    if (ProfileReducer?.remainingLeavesResponse?.leaves?.length > 0) {
      setRemainingLeaves(ProfileReducer?.remainingLeavesResponse?.leaves);
    }
  }, [ProfileReducer?.remainingLeavesResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/leaveLogRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveLogSuccess':
        status = ProfileReducer.status;
        console.log('Kick===========>>leaveLogSuccess');

        break;
      case 'Profile/leaveLogFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveCancelRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveCancelSuccess':
        status = ProfileReducer.status;
        console.log('Kick===========>>leaveCancelSuccess');

        connectionrequest()
          .then(() => {
            dispatch(leaveLogRequest());
          })
          .catch(err => {
            console.log(err);
            showErrorAlert('Please connect to internet');
          });
        break;
      case 'Profile/leaveCancelFailure':
        status = ProfileReducer.status;
        break;
    }
  }
  return (
    <View style={styles.container}>
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveCancelRequest' ||
          ProfileReducer?.status == 'Profile/leaveLogRequest'
        }
      />

      {/* Leave Summary Section */}
      {remainingLeaves.length > 0 && (
        <View style={styles.leaveSummarySection}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Leave Summary</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <FlatList
            data={remainingLeaves}
            keyExtractor={item => item.leave_type_id.toString()}
            renderItem={renderLeaveSummaryCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leaveSummaryList}
            ItemSeparatorComponent={() => (
              <View style={{ width: normalize(10) }} />
            )}
          />
        </View>
      )}

      {/* Leave History Section */}
      <View style={styles.leaveHistorySection}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Leave History</Text>
          <View style={styles.sectionUnderline} />
        </View>
        <FlatList
          data={LeavelogList}
          keyExtractor={item => item.id}
          renderItem={renderLeavelog}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default Leavelog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bgColor,
    paddingHorizontal: 10,
  },

  // Leave Summary Styles
  leaveSummarySection: {
    marginTop: normalize(10),
    marginBottom: normalize(20),
  },
  sectionHeaderContainer: {
    marginBottom: normalize(15),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
    marginBottom: normalize(5),
  },
  sectionUnderline: {
    width: normalize(35),
    height: normalize(3),
    backgroundColor: Colors.primary || '#007bff',
    borderRadius: normalize(2),
  },
  leaveSummaryList: {
    paddingVertical: normalize(5),
  },
  leaveSummaryCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(10),
    padding: normalize(14),
    width: normalize(220),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  leaveTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  leaveTypeName: {
    fontSize: normalize(14),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    flex: 1,
    marginRight: normalize(8),
  },
  leaveBadge: {
    backgroundColor: Colors.lightBlue || '#e3f2fd',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: normalize(18),
  },
  leaveBadgeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.MulishBold,
    color: Colors.primary || '#007bff',
  },
  leaveProgressContainer: {
    marginBottom: normalize(12),
  },
  leaveProgressBar: {
    height: normalize(5),
    backgroundColor: Colors.lightGray || '#f0f0f0',
    borderRadius: normalize(3),
    marginBottom: normalize(6),
    overflow: 'hidden',
  },
  leaveProgressFill: {
    height: '100%',
    borderRadius: normalize(3),
  },
  usedLeavesText: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.gray || '#666',
    textAlign: 'right',
  },
  leaveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveStat: {
    alignItems: 'center',
    flex: 1,
  },
  leaveStatNumber: {
    fontSize: normalize(16),
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    marginBottom: normalize(2),
  },
  leaveStatLabel: {
    fontSize: normalize(10),
    fontFamily: Fonts.MulishRegular,
    color: Colors.gray || '#666',
  },

  // Leave History Styles
  leaveHistorySection: {
    flex: 1,
  },
  flatList: {
    flex: 1,
    width: '100%',
    paddingBottom: normalize(100),
    marginBottom: normalize(100),
  },
  listContainer: {
    width: '100%',
    paddingBottom: normalize(100),
    marginBottom: normalize(100),
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  itemContainer: {
    borderRadius: normalize(2),
    backgroundColor: Colors.white,
    width: '100%',
    padding: normalize(10),
    marginTop: normalize(10),
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: normalize(5),
  },
  lebel: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  lebelValue: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
});
