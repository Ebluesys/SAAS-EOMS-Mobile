import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header';
import { Colors, Fonts } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';

const HolidayList = () => {
const holidays = [
  { id: '1', name: 'Republic Day', date: 'January 26, 2025', type: 'National' },
  { id: '2', name: 'Maha Shivratri', date: 'February 26, 2025', type: 'Religious' },
  { id: '3', name: 'Holi', date: 'March 14, 2025', type: 'Religious' },
  { id: '4', name: 'Good Friday', date: 'April 18, 2025', type: 'Religious' },
  { id: '5', name: 'Ram Navami', date: 'April 6, 2025', type: 'Religious' },
  { id: '6', name: 'Independence Day', date: 'August 15, 2025', type: 'National' },
  { id: '7', name: 'Janmashtami', date: 'August 16, 2025', type: 'Religious' },
  { id: '8', name: 'Gandhi Jayanti', date: 'October 2, 2025', type: 'National' },
  { id: '9', name: 'Dussehra', date: 'October 2, 2025', type: 'Religious' },
  { id: '10', name: 'Diwali', date: 'October 20, 2025', type: 'Religious' },
  { id: '11', name: 'Guru Nanak Jayanti', date: 'November 5, 2025', type: 'Religious' },
  { id: '12', name: 'Christmas Day', date: 'December 25, 2025', type: 'Religious' }
];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.nameColumn]}>Holiday Name</Text>
        <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
        {/* <Text style={[styles.headerText, styles.typeColumn]}>Type</Text> */}
      </View>
    </View>
  );

  const renderHolidayItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      index % 2 === 0 ? styles.evenRow : styles.oddRow
    ]}>
      <Text style={[styles.itemText, styles.nameColumn, styles.holidayName]}>
        {item.name}
      </Text>
      <Text style={[styles.itemText, styles.dateColumn]}>
        {item.date}
      </Text>
      {/* <View style={styles.typeColumn}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View> */}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        Total holidays: {holidays.length}
      </Text>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' }}>
      <Header
        HeaderLogo
        Title
        placeText={'Holiday List'}
        onPress_back_button={() => {
          setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />

      <View style={styles.container}>
                <Text style={styles.title}>2025 Holiday Calendar</Text>


        <FlatList
          data={holidays}
          keyExtractor={(item) => item.id}
          renderItem={renderHolidayItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

export default HolidayList

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
    paddingBottom:normalize(60)
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginTop:normalize(10)
  },
  flatList: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom:normalize(50)
  },
  headerContainer: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  itemText: {
    fontSize: 14,
    color: '#495057',
  },
  holidayName: {
    fontWeight: '500',
    color: '#212529',
  },
  nameColumn: {
    flex: 2,
  },
  dateColumn: {
    flex: 1.5,
  },
  typeColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  typeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  typeBadgeText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
  },
})