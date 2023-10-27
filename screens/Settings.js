import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { useNavigation } from '@react-navigation/native';

//import BLEScanner from './BLEScanner';
//import * as Location from 'expo-location';

export default function SettingsModal({ isVisible, onClose }) {
  // State to track whether Bluetooth permissions have been requested
  /*
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
  */

  const navigation = useNavigation(); // Get the navigation object
  
    const handleRemovePage = () => {
      navigation.pop(); // This will remove the "Settings Page" from the stack.
    };
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 20 }}>
          <View style={{ position: 'absolute', top: -10, right: 20 }}>
            <TouchableOpacity onPress={handleRemovePage}>
              <View style={{ backgroundColor: 'red', borderRadius: 20, padding: 10 }}>
                <Ionicons name="ios-close" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Settings Page</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', top: 200, left: 55 }}>
            <TouchableOpacity onPress={() => alert("Bluetooth button pressed")} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
              <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Connect Bluetooth Chair</Text>
            </TouchableOpacity>
            </View>
        <View style={{ position: 'absolute', top: 300, left: 150 }}>
            <TouchableOpacity onPress={() => alert("Account Information")} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
              <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Account</Text>
            </TouchableOpacity>
            </View>
      </SafeAreaView>
    );
  }
