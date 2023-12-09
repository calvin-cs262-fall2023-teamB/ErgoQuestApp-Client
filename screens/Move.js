import React, { useState, useEffect, useRef } from 'react';  // useEffect added
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
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const fetchData = async () => {
    try {
      console.log('Fetching data for user:', global.userData.id);
  
      // Fetch motors data
      const motorsResponse = await fetch('https://ergoquestapp.azurewebsites.net/motors');
      const motorsData = await motorsResponse.json();
      console.log('Motors data:', motorsData);
  
      // Fetch motor positions data
      const motorPositionsResponse = await fetch('https://ergoquestapp.azurewebsites.net/motorpositions');
      const motorPositionsData = await motorPositionsResponse.json();
      console.log('Motor positions data:', motorPositionsData);
  
      console.log('Global Data: ', global.userData);
  
      // Filter motor positions by global.userData.id
      const filteredMotorPositions = motorPositionsData.filter(position => position?.userid && Number(position.userid) === Number(global.userData.id));
      console.log('Filtered motor positions:', filteredMotorPositions);
  
      // Merge the data
      const mergedData = filteredMotorPositions.map(motorPosition => {
        const motor = motorsData.find(m => m?.id && Number(m.id) === Number(motorPosition.motorid));
        return {
          id: motorPosition.motorid,
          name: motor ? motor.name : 'Unknown',
          percent: motorPosition.angle
        };
      });
  
      global.moves = mergedData;
      setMoves(mergedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data!');
    }
  };

  useEffect(() => {
    // Check if the user is logged in
    if (global.userData && global.userData.id) {
      fetchData(); // Call the fetchData function
    }
  }, [global.userData]);

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

  const increasePercent = async (index) => {
    const newMoves = [...global.moves];
    const currentPercent = newMoves[index].percent;
    const newPercent = currentPercent < 100 ? currentPercent + 1 : currentPercent;
    newMoves[index].percent = newPercent;
  
    setMoves(newMoves);
  
    if (global.userData && global.userData.id) {
      try {
        const selectedMotorId = newMoves[index].id;
        await confirmMotorAndPosition(selectedMotorId, newPercent);
      } catch (error) {
        console.error('Error updating motor position:', error);
        Alert.alert('Error', 'Failed to update motor position!');
      }
    } else {
      console.log('User not logged in. Local changes only.');
    }
  };
  
  const decreasePercent = async (index) => {
    const newMoves = [...global.moves];
    const currentPercent = newMoves[index].percent;
    const newPercent = currentPercent > 0 ? currentPercent - 1 : currentPercent;
    newMoves[index].percent = newPercent;
  
    setMoves(newMoves);
  
    if (global.userData && global.userData.id) {
      try {
        const selectedMotorId = newMoves[index].id;
        await confirmMotorAndPosition(selectedMotorId, newPercent);
      } catch (error) {
        console.error('Error updating motor position:', error);
        Alert.alert('Error', 'Failed to update motor position!');
      }
    } else {
      console.log('User not logged in. Local changes only.');
    }
  };

  const startChange = (action) => {
    stopChange(); // Clear any existing interval before starting a new one
    action();
    const id = setInterval(action, 100);
    setIntervalId(id);
  };
  
  const stopChange = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleNameChange = async () => {
    if (inputName.trim()) {
      // Update the local state
      const updatedMoves = global.moves.map((move, index) => {
        if (index === selectedMoveIndex) {
          return { ...move, name: inputName };
        }
        return move;
      });
  
      // Update global moves and local state
      global.moves = updatedMoves;
      setMoves(updatedMoves);
  
      // Update actuator names in presets
      for (let i = 0; i < global.presets.length; i++) {
        if (global.presets[i].actuatorValues[selectedMoveIndex].id === global.moves[selectedMoveIndex].id) {
          global.presets[i].actuatorValues[selectedMoveIndex].name = inputName;
        } else {
          for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
            if (global.presets[i].actuatorValues[j].id === global.moves[selectedMoveIndex].id) {
              global.presets[i].actuatorValues[j].name = inputName;
              break;
            }
          }
        }
      }
  
      // Proceed with database update if the user is logged in
      if (global.userData && global.userData.id) {
        try {
          const selectedMotorId = global.moves[selectedMoveIndex].id;
          await updateMotorName(selectedMotorId, inputName);
        } catch (error) {
          console.error('Error updating motor name:', error);
          Alert.alert('Error', 'Failed to update motor name!');
        }
      } else {
        console.log('User not logged in. Local changes only.');
      }
  
      setInputName('');
      setNameModalVisible(false);
    } else {
      Alert.alert('Error', 'Name cannot be empty!');
    }
  };
  


  const handlePercentChange = async () => {
    const newPercent = parseInt(inputPercent, 10);
    if (newPercent >= 0 && newPercent <= 100) {
      // Update the local state
      const updatedMoves = global.moves.map((move, index) => {
        if (index === selectedMoveIndex) {
          return { ...move, percent: newPercent };
        }
        return move;
      });
  
      // Update global moves and local state
      global.moves = updatedMoves;
      setMoves(updatedMoves);
      setUpdater(updater + 1);
  
      // Proceed with database update if the user is logged in
      if (global.userData && global.userData.id) {
        try {
          console.log(selectedMoveIndex);
          const selectedMotorId = global.moves[selectedMoveIndex].id;
          await confirmMotorAndPosition(selectedMotorId, newPercent);
        } catch (error) {
          console.error('Error updating motor position:', error);
          Alert.alert('Error', 'Failed to update motor position!');
        }
      } else {
        console.log('User not logged in. Local changes only.');
      }
  
      setInputPercent('');
      setValueModalVisible(false);
    } else {
      Alert.alert('Error', 'Percentage should be between 0 and 100!');
    }
  };

  const toggleMenuSize = () => {
    setIsMenuExpanded(!isMenuExpanded); // This toggles the expanded state
  };

  const OptionModal = ({ isVisible, onClose, options }) => (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        {options.map(option => (
          <TouchableOpacity key={option.label} onPress={option.action}>
            {/* Apply the style conditionally based on isMenuExpanded */}
            <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose}>
          <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
            Close
          </Text>
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
              onPress: () => removeMove(),
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

  const motorPositionExists = async (motorPositionId, userID) => {
    try {
      const response = await fetch(`https://ergoquestapp.azurewebsites.net/motorpositions/${motorPositionId}/${userID}`);
      if (response.ok) {
        const motorPositionData = await response.json();
        return !!motorPositionData.id; // If motor position data with the ID exists, return true
      }
      return false; // If the request fails, assume the motor position does not exist
    } catch (error) {
      console.error('Error checking motor position existence:', error);
      return false; // In case of error, assume the motor position does not exist
    }
  };
  
  const motorExists = async (motorId) => {
    try {
      const response = await fetch(`https://ergoquestapp.azurewebsites.net/motors/${motorId}`);
      if (response.ok) {
        const motorData = await response.json();
        return !!motorData.id; // If motor data with the ID exists, return true
      }
      return false; // If the request fails, assume the motor does not exist
    } catch (error) {
      console.error('Error checking motor existence:', error);
      return false; // In case of error, assume the motor does not exist
    }
  };
  
  
  const confirmMotorAndPosition = async (motorId, percent) => {
    try {
      // Get the motor name from global.moves
      const motorName = global.moves.find(move => move.id === motorId)?.name || 'New Actuator';
  
      let motorData;
  
      if (await motorExists(motorId)) {
        // Update existing motor
        const updateMotorResponse = await fetch(`https://ergoquestapp.azurewebsites.net/motors/${motorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: motorName }),
        });
        motorData = await updateMotorResponse.json();
      } else {
        // Create new motor
        const createMotorResponse = await fetch('https://ergoquestapp.azurewebsites.net/motors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: motorName }),
        });
        motorData = await createMotorResponse.json();
      }
  
      // Create or Update MotorPosition
      const motorPositionData = {
        angle: percent,
        motorID: motorData.id,
        userID: global.userData.id,
      };

  
      // Assuming a similar approach for motor position: check if it exists and then create or update
      // Implement motorPositionExists and updateMotorPosition logic as per your application's need
      if (await motorPositionExists(motorId, global.userData.id)) {
        // Update motor position
        await fetch(`https://ergoquestapp.azurewebsites.net/motorpositions/${motorId}/${global.userData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(motorPositionData),
        });
      } else {
        // Create motor position
        await fetch('https://ergoquestapp.azurewebsites.net/motorpositions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(motorPositionData),
        });
      }
    } catch (error) {
      console.error('Error confirming motor and position:', error);
      Alert.alert('Error', 'Failed to confirm motor and position!');
    }
  };
  
  const updateMotorName = async (motorId, newName) => {
    try {
      if (await motorExists(motorId)) {
        // Update existing motor's name
        await fetch(`https://ergoquestapp.azurewebsites.net/motors/${motorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });
      } else {
        // Create new motor if it doesn't exist
        await fetch('https://ergoquestapp.azurewebsites.net/motors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });
      }
    } catch (error) {
      console.error('Error updating motor name:', error);
      Alert.alert('Error', 'Failed to update motor name!');
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

  const removeMove = async () => {
    console.log(selectedMoveIndex);
    // Get the motor position ID before removal
    const motorPositionId = global.moves[selectedMoveIndex]?.id;

    // Remove the move from the local state
    const updatedMoves = global.moves.filter((_, i) => i !== selectedMoveIndex);
    global.moves = updatedMoves;
    setMoves(updatedMoves);
    setMenuVisible(false); // Close the menu after removing the move
  
    // Proceed with database deletion if the user is logged in
    if (global.userData && global.userData.id && motorPositionId !== undefined) {
      try {
        // Delete the motor position from the database
        await fetch(`https://ergoquestapp.azurewebsites.net/motorpositions/${motorPositionId}/${global.userData.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(`Motor position with ID ${motorPositionId} deleted from database.`);
      } catch (error) {
        console.error('Error deleting motor position:', error);
        Alert.alert('Error', 'Failed to delete motor position!');
      }
    } else {
      console.log('User not logged in. Only local changes made.');
    }
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
      <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
        Confirm
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setNameModalVisible(false)}>
      <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
        Close
      </Text>
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
      {/* Apply the style conditionally based on isMenuExpanded */}
      <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
        Confirm
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setValueModalVisible(false)}>
      {/* Apply the style conditionally based on isMenuExpanded */}
      <Text style={isMenuExpanded ? styles.optionTextExpanded : styles.optionText}>
        Close
      </Text>
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
    backgroundColor: '#43B2D1',
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

  optionText: {
    fontSize: 18, 
  },

  optionTextExpanded: {
    fontSize: 24, 
  },



});