import React, { useState, useEffect } from 'react';  // useEffect added
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';

export default function MoveScreen() {
    //DECLARATIONS
    const [name, setName] = useState('Default Name'); // Change 'Default Name' to any name you want as the initial value.
    const [percent, setPercent] = useState(6);
    const [isMenuModalVisible, setMenuModalVisible] = useState(false);
    const [isNameModalVisible, setNameModalVisible] = useState(false);
    const [isValueModalVisible, setValueModalVisible] = useState(false);
    const [inputName, setInputName] = useState('');
    const [inputPercent, setInputPercent] = useState('');
    const [intervalId, setIntervalId] = useState(null);
    const startIncreasing = () => startChange(increasePercent);
    const startDecreasing = () => startChange(decreasePercent);
    const [menuVisible, setMenuVisible] = useState(false);
    
    useEffect(() => {
      return () => {
          if (intervalId) {
              clearInterval(intervalId);
          }
      };
    }, [intervalId]);

    const increasePercent = () => {
        setPercent(prev => (prev < 100 ? prev + 1 : prev));
    };

    const decreasePercent = () => {
        setPercent(prev => (prev > 0 ? prev - 1 : prev));
    };

    const startChange = (action) => {
        action();
        const id = setInterval(action, 100);
        setIntervalId(id);
    };

    const stopChange = () => {
        clearInterval(intervalId);
        setIntervalId(null);
    };

    const handleNameChange = () => {
        if (inputName.trim()) {
            setName(inputName);
            setInputName('');
            setNameModalVisible(false);
        } else {
            Alert.alert('Error', 'Name cannot be empty!');
        }
    };

    const handlePercentChange = () => {
        const newPercent = parseInt(inputPercent, 10);
        if (newPercent >= 0 && newPercent <= 100) {
            setPercent(newPercent);
            setInputPercent('');
            setValueModalVisible(false);
        } else {
            Alert.alert('Error', 'Percentage should be between 0 and 100!');
        }
    };

    const OptionModal = ({ isVisible, onClose, options }) => (
        <Modal isVisible={isVisible}>
            <View style={styles.modalContent}>
                {options.map(option => (
                    <TouchableOpacity key={option.label} onPress={option.action}>
                        <Text>{option.label}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );

    const handleMenuOption = (option) => {
      if (option === 'name') {
          setNameModalVisible(true);
      } else if (option === 'value') {
          setValueModalVisible(true);
      }
  };

  const menuOptions = [
    { 
        label: 'Change Name', 
        action: () => {
            setMenuVisible(false); // Close the options modal
            setNameModalVisible(true);
        }
    },
    { 
        label: 'Change Value', 
        action: () => {
            setMenuVisible(false); // Close the options modal
            setValueModalVisible(true);
        }
    }
];


 
    return (
      <View style={styles.container}>
        <View style={styles.frame}>
          <View style={styles.header}>
            <Text style={styles.percentText}>{percent}%</Text>
            <Text style={styles.nameText}>{name}</Text>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Ionicons name="ellipsis-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.buttons}>
              <TouchableOpacity
                  style={styles.button}
                  onPressIn={startDecreasing}
                  onPressOut={stopChange}>
                  <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                  style={styles.button}
                  onPressIn={startIncreasing}
                  onPressOut={stopChange}>
                  <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.addMoveButton} onPress={() => {}}>
            <Text style={styles.addMoveButtonText}>ADD NEW MOVE</Text>
          </TouchableOpacity>
  
          <OptionModal 
              isVisible={menuVisible} 
              onClose={() => setMenuVisible(false)} 
              options={menuOptions} 
          />

          <Modal isVisible={isNameModalVisible}>
              <View style={styles.modalContent}>
                  <TextInput 
                      style={styles.input}
                      value={inputName}
                      onChangeText={setInputName}
                      placeholder="Enter new name"
                  />
                  <TouchableOpacity onPress={handleNameChange}>
                      <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setNameModalVisible(false)}>
                      <Text>Close</Text>
                  </TouchableOpacity>
              </View>
          </Modal>
  
          <Modal isVisible={isValueModalVisible}>
              <View style={styles.modalContent}>
                  <TextInput 
                      style={styles.input}
                      value={inputPercent}
                      onChangeText={setInputPercent}
                      placeholder="Enter new percentage (0-100)"
                      keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={handlePercentChange}>
                      <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setValueModalVisible(false)}>
                      <Text>Close</Text>
                  </TouchableOpacity>
              </View>
          </Modal>
      </View>
      );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100, // adjust this to move the frame up or down as you like
    backgroundColor: '#00BCD4',
  },
  frame: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    margin: 5,  // Add margin for spacing
  },
  percentText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%', // adjusted for bigger buttons
    marginBottom: 20,
  },
   button: {
    width: 60, // adjusted size
    height: 60, // adjusted size
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Updated to black background
    borderRadius: 30, // adjusted size
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // Updated to white color
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10, // added margin for better spacing
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 20,
  },

  addMoveButton: {
    marginTop: 'auto',  // pushes the button to the bottom of the available space
    marginBottom: 60,   // adds some space at the bottom for aesthetics
    width: '70%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,  // This value has been changed to match the frame's borderRadius
  },

addMoveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    

  },

});