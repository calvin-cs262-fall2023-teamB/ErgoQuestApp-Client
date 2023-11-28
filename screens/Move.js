import React, { useState, useEffect } from 'react';  // useEffect added
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, TextInput, Alert } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { ScrollView } from 'react-native';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
Might be needed for saving actuator positions between sessions:
https://react-native-async-storage.github.io/async-storage/docs/api/
else: always set to 0.
*/

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
  const startIncreasing = (index) => startChange(() => increasePercent(index));
  const startDecreasing = (index) => startChange(() => decreasePercent(index));
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);
  const [moves, setMoves] = useState([]); // for display ONLY (not keeping or updating values)
  const [updater, setUpdater] = useState(0); // for updating flat list on create

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useFocusEffect(() => {
    setMoves(global.moves);
    return () => {
      setMoves(global.moves);
    }
  });

  const increasePercent = (index) => {
    const currentPercent = global.moves[index].percent;
    global.moves[index].percent = currentPercent < 100 ? currentPercent + 1 : currentPercent;
    setMoves(global.moves);
  };

  const decreasePercent = (index) => {
    const currentPercent = global.moves[index].percent;
    global.moves[index].percent = currentPercent > 0 ? currentPercent - 1 : currentPercent;
    setMoves(global.moves);
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
      global.moves[selectedMoveIndex].name = inputName;
      setMoves(global.moves);
      // update actuator names in presets
      for (let i = 0; i < global.presets.length; i++) {
        if (global.presets[i].actuatorValues[selectedMoveIndex].id = global.moves[selectedMoveIndex].id) {
          global.presets[i].actuatorValues[selectedMoveIndex].name = inputName;
        } else {
          for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
            if (global.presets[i].actuatorValues[j].id = global.moves[selectedMoveIndex].id) {
              global.presets[i].actuatorValues[j].name = inputName;
              break;
            }
          }
        }
      }
      // TODO: sync new preset settings to database
      setInputName('');
      setNameModalVisible(false);
    } else {
      Alert.alert('Error', 'Name cannot be empty!');
    }
  };


  const handlePercentChange = () => {
    const newPercent = parseInt(inputPercent, 10);
    if (newPercent >= 0 && newPercent <= 100) {
      global.moves[selectedMoveIndex].percent = newPercent;
      setMoves(global.moves);
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
    },
    // Add the "Remove Move" option
    {
      label: 'Remove Move',
      action: () => {
        Alert.alert(
          'Remove Move',
          'Are you sure you want to remove this move?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => removeMove(selectedMoveIndex),
            },
          ],
          { cancelable: false }
        );
        setMenuVisible(false); // Close the options modal
      }
    }
  ];

  const addNewMove = () => {
    if (global.moves.length < 6) {
      let minimumOpenID = 1; // find lowest open ID value
      for (let i = 1; i < 7; i++) {
        for (let j = 0; j < global.moves.length; j++) {
          if (global.moves[j].id == i) { // compare with type conversion in case id is read as string
            minimumOpenID = i + 1;
            continue;
          }
        }
        if (minimumOpenID == i) {
          break;
        }
      }
      global.moves.push({ id: minimumOpenID, name: 'New Actuator', percent: 0 }); // did not refresh screen
      global.moves[0].id = global.moves[0].id;
      setMoves(global.moves);
      setUpdater(updater + 1);
      // update actuator count in presets
      for (let i = 0; i < global.presets.length; i++) {
        global.presets[i].actuatorValues.push({
          id: minimumOpenID,
          name: 'New Actuator',
          percent: 0
        });
      }
      // TODO: sync new preset settings to database
    } else {
      Alert.alert('Error', 'You can only add up to 6 moves!');
    }
  };

  const renderMove = ({ item, index }) => (
    <View style={styles.frame}>
      <View style={styles.header}>
        <Text style={styles.percentText}>{item.percent}%</Text>
        <Text style={styles.nameText}>{item.name}</Text>
        <TouchableOpacity onPress={() => {
          setSelectedMoveIndex(index); // Update the selected move index
          setMenuVisible(!menuVisible);
        }}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startDecreasing(index)}  // Pass the index here
          onPressOut={stopChange}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startIncreasing(index)}  // Pass the index here
          onPressOut={stopChange}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Separator = () => {
    return (
      <View style={{ height: 1 }}></View>
    );
  }

  const removeMove = (index) => {
    global.moves = (global.moves.filter((_, i) => i !== index));
    setMoves(global.moves);
    setMenuVisible(false); // Close the menu after removing the move
  };



  return (
    <SafeAreaView style={styles.container}>

      <FlatList
        data={moves}
        scrollEnabled={true}
        style={{ maxWidth: "100%" }} // fixes horizontal scroll issue
        extraData={updater} // allows for immediate re-render when adding new moves; otherwise, re-rendered upon screen movement
        renderItem={renderMove}   // Use the renderMove function here
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={Separator} />

      <TouchableOpacity
        style={styles.addMoveButton}
        onPress={addNewMove}
      >
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
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  // changed from 'flex-start'
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#00BCD4',
    maxWidth: "100%",
  },
  frame: {
    marginLeft: 34,
    marginTop: 30,
    width: '80%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
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
    marginBottom: 40,   // adds some space at the bottom for aesthetics
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