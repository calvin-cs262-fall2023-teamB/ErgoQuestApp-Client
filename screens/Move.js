import React, { useState, useEffect } from 'react';  // useEffect added
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { ScrollView } from 'react-native';
import { FlatList } from 'react-native';



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
    const [moves, setMoves] = useState([{ name: 'Default Name', percent: 6 }]);
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);
    
    useEffect(() => {
      return () => {
          if (intervalId) {
              clearInterval(intervalId);
          }
      };
    }, [intervalId]);

    const increasePercent = (index) => {
        setMoves(prevMoves => {
            const updatedMoves = [...prevMoves];
            const currentPercent = updatedMoves[index].percent;
            updatedMoves[index].percent = currentPercent < 100 ? currentPercent + 1 : currentPercent;
            return updatedMoves;
        });
    };
    
    const decreasePercent = (index) => {
        setMoves(prevMoves => {
            const updatedMoves = [...prevMoves];
            const currentPercent = updatedMoves[index].percent;
            updatedMoves[index].percent = currentPercent > 0 ? currentPercent - 1 : currentPercent;
            return updatedMoves;
        });
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
            setMoves(prevMoves => {
                const updatedMoves = [...prevMoves];
                updatedMoves[selectedMoveIndex].name = inputName;
                return updatedMoves;
            });
            setInputName('');
            setNameModalVisible(false);
        } else {
            Alert.alert('Error', 'Name cannot be empty!');
        }
    };
    

    const handlePercentChange = () => {
        const newPercent = parseInt(inputPercent, 10);
        if (newPercent >= 0 && newPercent <= 100) {
            setMoves(prevMoves => {
                const updatedMoves = [...prevMoves];
                updatedMoves[selectedMoveIndex].percent = newPercent;
                return updatedMoves;
            });
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
    if (moves.length < 6) {
      setMoves([...moves, { name: 'Default Name', percent: 6 }]);
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
      <View style={{ height: 20 }}></View>
    );
  }
  
  const removeMove = (index) => {
    setMoves(prevMoves => prevMoves.filter((_, i) => i !== index));
    setMenuVisible(false); // Close the menu after removing the move
  };



  return (
    <SafeAreaView style={styles.container}>
  
      <FlatList
        data={moves}
        renderItem={renderMove}   // Use the renderMove function here
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={Separator}/>
          
    
  
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