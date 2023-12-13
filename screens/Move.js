import React, { useState, useEffect } from 'react';  // useEffect added
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { FlatList } from 'react-native';

/*
Might be needed for saving actuator positions between sessions:
https://react-native-async-storage.github.io/async-storage/docs/api/
else: always set to 0.
*/

export default function MoveScreen(  ) { // may need ( navigation ) for commented out functions
  //DECLARATIONS
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

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useFocusEffect(() => {
    global.help = "Move";
    setMoves(global.moves);
    return () => {
      setMoves(global.moves);
    }
  });

  const increasePercent = (index) => {
    setMoves((currentMoves) => {
      const newMoves = [...currentMoves];
      const currentPercent = newMoves[index].percent;
      newMoves[index].percent = currentPercent < 100 ? currentPercent + 1 : currentPercent;
      return newMoves;
    });
  };
  
  const decreasePercent = (index) => {
    setMoves((currentMoves) => {
      const newMoves = [...currentMoves];
      const currentPercent = newMoves[index].percent;
      newMoves[index].percent = currentPercent > 0 ? currentPercent - 1 : currentPercent;
      return newMoves;
    });
  };

  const startChange = (action) => {
    stopChange(); // Clear any existing interval before starting a new one
    global.moveReady = false; // may not want this. Could cause delays
    action();
    const id = setInterval(action, 100);
    setIntervalId(id);
  };
  
  const stopChange = () => {
    global.moveReady = true;
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleNameChange = () => {
    if (inputName.trim()) {
      global.moves[selectedMoveIndex].name = inputName;
      setMoves(global.moves);
      // update actuator names in presets
      for (let i = 0; i < global.presets.length; i++) {
        if (global.presets[i].actuatorValues[selectedMoveIndex].id == global.moves[selectedMoveIndex].id) {
          global.presets[i].actuatorValues[selectedMoveIndex].name = inputName;
        } else {
          for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
            if (global.presets[i].actuatorValues[j].id == global.moves[selectedMoveIndex].id) {
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
            <Text style={styles.optionText}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.optionText}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const menuOptions = [
    {
      label: 'Change Name',
      action: () => {
        setMenuVisible(false); // Close the options modal
        global.moveReady = false;
        setNameModalVisible(true);
      }
    },
    {
      label: 'Change Value',
      action: () => {
        setMenuVisible(false); // Close the options modal
        global.moveReady = false;
        setValueModalVisible(true);
      }
    }
  ];

  const createNewPreset = () => {
    let largestIndex = 1;
    for (let i = 0; i < global.presets.length; i++) {
        if (global.presets[i].id > largestIndex) {
            largestIndex = global.presets[i].id;
        }
    }
    const newID = largestIndex + 1;
    const tempName = "Preset " + newID + "";
    let newPresets = [];
    for (let i = 0; i < global.presets.length; i++) {
        newPresets.push(global.presets[i]);
    }
    newPresets.push({
        name: tempName,
        id: newID,
        actuatorValues: global.moves,
    });
    global.presets = newPresets;
    alert("Preset created successfully!");
    // navigation.navigate("Presets");
  };

  const renderMove = ({ item, index }) => (
    <View style={styles.frame}>
      {/* TouchableOpacity wraps the entire upper part */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => {
          setSelectedMoveIndex(index); // Set the index for the selected move
          global.moveReady = false;
          setMenuVisible(true); // Open the modal
        }}
      >
        <Text style={styles.percentText}>{item.percent}%</Text>
        <Text style={styles.nameText}>{item.name}</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="black" />
      </TouchableOpacity>
  
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startDecreasing(index)}
          onPressOut={stopChange}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startIncreasing(index)}
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


  return (
    <SafeAreaView style={styles.container}>

      <FlatList
        data={moves}
        scrollEnabled={true}
        style={{ maxWidth: "100%" }} // fixes horizontal scroll issue
        renderItem={renderMove}   // Use the renderMove function here
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={Separator} />

      <TouchableOpacity
        style={styles.addMoveButton}
        onPress={createNewPreset}
      >
        <Text style={styles.addMoveButtonText}>Create New Preset</Text>
      </TouchableOpacity>

      <OptionModal
        isVisible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          global.moveReady = true;
        }}
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
      <Text style={styles.optionText}>
        Confirm
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setNameModalVisible(false)}>
      <Text style={styles.optionText}>
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
      <Text style={styles.optionText}>
        Confirm
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setValueModalVisible(false)}>
      <Text style={styles.optionText}>
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
    width: '80%', // adjusted for bigger buttons
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
    padding: 75,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 20,
  },

  addMoveButton: {
    marginTop: 15,  // pushes the button to the bottom of the available space
    marginBottom: 25,   // adds some space at the bottom for aesthetics
    width: '88%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,  // This value has been changed to match the frame's borderRadius
  },

  addMoveButtonText: {
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
    fontSize: 24,
    padding: "5%",
    width: "100%",
    height: "100%",
  },

  optionText: {
    fontSize: 26,
    marginVertical: 8, 
  },

  optionTextExpanded: {
    fontSize: 26, 
    marginVertical: 10,
  },



});