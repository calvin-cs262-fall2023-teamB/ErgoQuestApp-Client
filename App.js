import React, { useState } from 'react';
import { View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
//import Modal from 'react-native-modal';
import { globalStyles } from './styles/global';
import MoveScreen from './screens/Move';
import PresetsScreen from './screens/Presets';
import TimedScreen from './screens/Timed';
import HelpModal from './screens/HelpModal';
import SettingsModal from './screens/Settings';
import LoginScreen from './screens/LoginPage';
import CreateAccountScreen from './screens/createAccountScreen';

import './screens/global';

//const { width, height } = Dimensions.get('window');

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();


function HomeScreen({ navigation }) {
  //const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  /*
  const toggleSettingsVisible = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };
  */

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
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="ios-cog" size={36} color="black" />
        </TouchableOpacity>
      </View>
      <Tab.Navigator tabBarPosition="bottom">
      <Tab.Screen
      name="Move"
      component={MoveScreen}
      style={globalStyles.general}
      options={{
        tabBarLabel: 'Move',
        tabBarIcon: () => <Ionicons name="ios-move" size={24} color="black" />,
      }}
    />
        <Tab.Screen
          name="Presets"
          component={PresetsScreen}
          style={globalStyles.general}
          options={{
            tabBarLabel: 'Presets',
            tabBarIcon: () => <Ionicons name="ios-create" size={24} color="black" />,
          }}
        />
        <Tab.Screen
          name="Timed"
          component={TimedScreen}
          style={globalStyles.general}
          options={{
            tabBarLabel: 'Timed',
            tabBarIcon: () => <Ionicons name="ios-time" size={24} color="black" />,
          }}
        />
      </Tab.Navigator>
      <HelpModal isVisible={isHelpVisible} onClose={toggleHelpVisible} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsModal} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

