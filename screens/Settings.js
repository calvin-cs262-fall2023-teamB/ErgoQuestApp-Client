import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';

//import BLEScanner from './BLEScanner';
//import * as Location from 'expo-location';

export default function SettingsModal({ isVisible, onClose, route }) {
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

  const userData = route?.params?.userData || null;
  const navigation = useNavigation(); // Get the navigation object
  const [actuatorCount, setActuatorCount] = useState(1);

  const showAccountInfo = () => {
    if (global.userData) {
      // If userData is available, show an alert with the user's information
      alert(`Name: ${global.userData.name}\nEmail: ${global.userData.email}`);
    } else {
      // If userData is not available, show a different message
      alert("Not logged in.");
    }
  };

  const handleLogout = () => {
    if (global.userData) {
      alert(`User ${global.userData.name} logged out`);
      global.userData = null;
      global.moves = [{"id": 1, "name": "default value", "percent": 0}, {"id": 2, "name": "other actuator", "percent": 0}];
    } else {
      alert("Not logged in.");
    }
  }

  const handleRemovePage = () => {
    navigation.pop(); // This will remove the "Settings Page" from the stack.
  };

  const navigateToLogin = () => {
    //setIsSettingsVisible(false); // Close the modal
    navigation.navigate('Login'); // Navigate
  };

  const confirmActuatorCount = () => {
    if (actuatorCount){
      if (actuatorCount >= 1 && actuatorCount <= 7){
        const curr = global.moves.length;
        let newMoves = [];
        // set moves to proper length
        for (let i = 0; i < actuatorCount; i++) {
          if (i < curr){
            newMoves.push(global.moves[i])
          } else {
            newMoves.push({"id": (i + 1), "name": ("Actuator " + (i + 1) + ""), "percent": 0});
          }
        }
        global.moves = newMoves;
        // edit presets to right length
        for (let i = 0; i < global.presets.length; i++){
          let newValues = [];
          for (let j = 0; j < actuatorCount; j++){
            if (j < curr){
              newValues.push(global.presets[i].actuatorValues[j])
            } else {
              newValues.push({"id": (i + 1), "name": ("Actuator " + (i + 1) + ""), "percent": 0});
            }
          }
          global.presets[i].actuatorValues = newValues;
        }
        alert("Success!");
      } else {
        alert("Error, you must have between 1 and 7 actuators.");
      }
    } else {
      alert("Error, cannot leave field blank.");
    }
  }

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
      {/* Bluetooth */}
      <View style={{ position: 'absolute', top: 200, left: 55 }}>
        <TouchableOpacity onPress={() => alert("Bluetooth button pressed")} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Connect Bluetooth Chair</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 300, left: 55 }}>
        <TextInput
            keyboardType = 'numeric'
            style={{ fontSize: 24, color: 'black', fontWeight: 'bold', borderRadius: 50, borderWidth: 2, borderColor: 'black', textAlign: "center" }}
            value={actuatorCount}
            onChangeText={setActuatorCount}
            placeholder="Actuators (1-7)"
          />
        <TouchableOpacity onPress={confirmActuatorCount} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Set number of actuators</Text>
        </TouchableOpacity>
      </View>
      {/* Account */}
      <View style={{ position: 'absolute', top: 400, left: 130 }}>
        <TouchableOpacity onPress={showAccountInfo} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Account</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 500, left: 150 }}>
        <TouchableOpacity onPress={navigateToLogin} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Log In</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 600, left: 135 }}>
        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
