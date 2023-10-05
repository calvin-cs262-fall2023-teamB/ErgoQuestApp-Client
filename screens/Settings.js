import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import BLEScanner from './BLEScanner';
import * as Location from 'expo-location';

export default function SettingsModal({ isVisible, onClose }) {
  // State to track whether Bluetooth permissions have been requested
  const [bluetoothPermissionRequested, setBluetoothPermissionRequested] = useState(false);

  // Function to request Bluetooth and Location permissions
  const requestBluetoothPermission = async () => {
    let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (locationStatus !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    // Bluetooth permissions are no longer explicitly requested using Expo
    // You can use Bluetooth features as needed, assuming the Location permission is granted.
    
    console.log('Location permission granted');
  };

  // useEffect to request Bluetooth permissions only the first time the modal is opened
  useEffect(() => {
    if (!bluetoothPermissionRequested) {
      requestBluetoothPermission();
      setBluetoothPermissionRequested(true); // Set the flag to true to prevent re-requesting
    }
  }, []);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View style={globalStyles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={globalStyles.closeButton}>
          <Ionicons name="ios-close-circle" size={36} color="black" />
        </TouchableOpacity>
        <Text>Settings Page</Text>
        <BLEScanner />
      </View>
    </Modal>
  );
}