import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import DeviceModal from "./DeviceConnectionModal";
import { PulseIndicator } from "./PulseIndicator";
import useBLE from "./useBLE";
import BLEConnection from './BLEConnection'; // Import the BLEConnection component

const { width, height } = Dimensions.get('window');

const MoveScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Move Page</Text>
  </View>
);

const PresetsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Presets Page</Text>
  </View>
);

const TimedScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Timed Page</Text>
  </View>
);

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const toggleSettingsVisible = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };
  const toggleHelpVisible = () => {
    setIsHelpVisible(!isHelpVisible);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginTop: -15 }}>
        <TouchableOpacity onPress={toggleHelpVisible}>
          <Ionicons name="ios-help-circle" size={36} color="black" />
        </TouchableOpacity>
        <Image source={require('./assets/StolenLogo_ErgoQuest.png')} />
        <TouchableOpacity onPress={toggleSettingsVisible}>
          <Ionicons name="ios-cog" size={36} color="black" />
        </TouchableOpacity>
      </View>
      <Tab.Navigator tabBarPosition="bottom">
        <Tab.Screen
          name="Move"
          component={MoveScreen}
          options={{
            tabBarLabel: 'Move',
            tabBarIcon: () => <Ionicons name="ios-move" size={24} color="black" />,
          }}
        />
        <Tab.Screen
          name="Presets"
          component={PresetsScreen}
          options={{
            tabBarLabel: 'Presets',
            tabBarIcon: () => <Ionicons name="ios-create" size={24} color="black" />,
          }}
        />
        <Tab.Screen
          name="Timed"
          component={TimedScreen}
          options={{
            tabBarLabel: 'Timed',
            tabBarIcon: () => <Ionicons name="ios-time" size={24} color="black" />,
          }}
        />
      </Tab.Navigator>
      <SettingsModal isVisible={isSettingsVisible} onClose={toggleSettingsVisible} />
      <HelpModal isVisible={isHelpVisible} onClose={toggleHelpVisible} />
    </SafeAreaView>
  );
}

function SettingsModal({ isVisible, onClose }) {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="ios-close-circle" size={36} color="black" />
        </TouchableOpacity>
        <Text>Settings Page</Text>
        {/* Add the BLEConnection component to the settings modal */}
        <BLEConnection />
      </View>
    </Modal>
  );
}

function HelpModal({ isVisible, onClose }) {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="ios-close-circle" size={36} color="black" />
        </TouchableOpacity>
        <Text>Help Page</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}