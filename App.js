import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
// style imports
import { globalStyles } from './styles/global';
// Screen imports
import MoveScreen from './screens/Move';
import PresetsScreen from './screens/Presets';
import TimedScreen from './screens/Timed';
import SettingsModal from './screens/Settings';
import HelpModal from './screens/HelpModal';

const { width, height } = Dimensions.get('window');

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

// HomeScreen to remain in App.js
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}