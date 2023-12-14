import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';


const MoveScreen = () => {
  const [moveList, setMoveList] = useState([{ moveID: 1, presetID: 1, time: 30 }]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(global.presets.length > 0 ? global.presets[0].id : -1);
  const [selectedTime, setSelectedTime] = useState('5');
  const [updater, setUpdater] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [editedMove, setEditedMove] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [editingMoveIndex, setEditingMoveIndex] = useState(null);

  



  useEffect(() => {
    let interval;
    let startTime;
    let elapsedTime = 0;
  
    const startTimer = () => {
      startTime = performance.now();
      interval = setInterval(() => {
        const now = performance.now();
        const elapsedSeconds = (now - startTime) / 1000;
        elapsedTime += elapsedSeconds;
  
        setCountdown((prevCountdown) => {
          const adjustedCountdown = prevCountdown - Math.floor(elapsedTime);
          if (adjustedCountdown <= 0) {
            startNextMove();
            return 0;
          }
          return adjustedCountdown;
        });
  
        startTime = now;
      }, 1000); // Run every second
    };
  
    if (isPlaying && countdown > 0) {
      startTimer();
    } else if (isPlaying && countdown === 0) {
      startNextMove();
    }
  
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, countdown, currentMoveIndex, moveList]);
  
  

  useFocusEffect(() => {
    global.help = "Timed";
    if (global.times.length !== moveList.length) {
      setMoveList(JSON.parse(JSON.stringify(global.times)));
      setIsPlaying(false);
    }
    return () => {};
  });

  // functions
  const startNextMove = () => {
    const nextIndex = currentMoveIndex + 1;
  
    if (nextIndex < moveList.length || (nextIndex === moveList.length && isLooping)) {
      const nextMove = nextIndex < moveList.length ? moveList[nextIndex] : moveList[0];
  
      setCurrentMoveIndex(nextIndex < moveList.length ? nextIndex : 0);
      setCountdown(nextMove.time * 60);
      setIsPlaying(true);
      const presetName = getNameFromID(nextMove.presetID);
  
      // Update global.moves based on the selected preset
      updateMovesForPreset(nextMove.presetID);
  
      console.log(`Starting Preset: ${presetName}`);
    } else {
      setIsPlaying(false);
    }
  };
  

  const startTimer = () => {
    if (!isPlaying && moveList.length > 0) {
      const topMove = moveList[currentMoveIndex];
      const timeInSeconds = countdown > 0 ? countdown : topMove.time * 60;
      setCountdown(timeInSeconds);
      setIsPlaying(true);

      // Log the starting preset for the first move
      const presetName = getNameFromID(topMove.presetID);

      // Update global.moves based on the selected preset
      updateMovesForPreset(topMove.presetID);

      console.log(`Starting Preset: ${presetName}`);
    } else {
      setIsPlaying(false);
    }
  };


 

  const stopTimer = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
    setCountdown(0);
  };

  const addNewMove = () => {
    if (selectedPreset === null || selectedPreset === -1) {
      setErrorMessage('Error: No preset selected');
      return;
    }
  
    global.times.push({ presetID: selectedPreset, time: selectedTime });
    JSON.parse(JSON.stringify(global.times));
    setUpdater(updater + 1);
    setErrorMessage(''); // Clear error message on successful move addition
  
    // Reset selectedPreset to a default value (modify if needed)
    setSelectedPreset(global.presets.length > 0 ? global.presets[0].id : -1);
    setSelectedTime('5'); // Reset selectedTime to a default value (modify if needed)
  };

  const editMove = (index) => {
    setEditingMoveIndex(index);
    setIsModalVisible(true);
  
    // Retrieve the preset and time of the move being edited
    const moveToEdit = moveList[index];
    setSelectedPreset(moveToEdit.presetID);
    setSelectedTime(moveToEdit.time.toString());
  
    // Set the currently edited move
    setEditedMove(moveToEdit);
  };
  

  const moveMoveDown = (index) => {
    if (index < moveList.length - 1) {
      const updatedMoveList = [...moveList];
      const temp = updatedMoveList[index];
      updatedMoveList[index] = updatedMoveList[index + 1];
      updatedMoveList[index + 1] = temp;
      setMoveList(updatedMoveList);
      global.times = JSON.parse(JSON.stringify(updatedMoveList));
      setIsModalVisible(false);
      setUpdater(updater - 1);
    }
  };

  const moveMoveUp = (index) => {
    if (index > 0) {
      const updatedMoveList = [...moveList];
      const temp = updatedMoveList[index];
      updatedMoveList[index] = updatedMoveList[index - 1];
      updatedMoveList[index - 1] = temp;
      setMoveList(updatedMoveList);
      global.times = JSON.parse(JSON.stringify(updatedMoveList));
      setIsModalVisible(false);
      setUpdater(updater - 1);
    }
  };

  const deleteMove = () => {
    if (editingMoveIndex !== null) {
      setMoveList((prevMoveList) => {
        const updatedMoveList = [...prevMoveList];
        updatedMoveList.splice(editingMoveIndex, 1);
  
        if (currentMoveIndex >= updatedMoveList.length && updatedMoveList.length > 0) {
          setCurrentMoveIndex(updatedMoveList.length - 1);
        } else if (currentMoveIndex >= updatedMoveList.length && updatedMoveList.length === 0) {
          setCurrentMoveIndex(0);
          setIsPlaying(false);
        }
  
        global.times = JSON.parse(JSON.stringify(updatedMoveList));
  
        return updatedMoveList;
      });
  
      setEditingMoveIndex(null);
      setIsModalVisible(false);
      setUpdater(updater + 1);
    }
  };
  
  
  
  
  
  
  
  
  
  


  const saveEdit = () => {
    const updatedMoveList = [...moveList];
    if (selectedPreset && selectedPreset >= 0) {
      updatedMoveList[currentMoveIndex].presetID = selectedPreset;
    }
    updatedMoveList[currentMoveIndex].time = selectedTime;

    setMoveList(updatedMoveList);
    global.times = JSON.parse(JSON.stringify(updatedMoveList));
    setIsModalVisible(false);
    setUpdater(updater + 1);

    // Move the highlight to the top without modifying the list
    setCurrentMoveIndex(0);
  };

  const getNameFromID = (id) => {
    for (let i = 0; i < global.presets.length; i++) {
      if (global.presets[i].id == id) { // use == not ===; type conversion needed
        return global.presets[i].name;
      }
    }
    console.log("No name found for id", id);
    return "null";
  }
  
  

  const formatTime = (seconds) => {
    if (seconds <= 0) {
      return 'Timer stopped';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeParts = [];

    if (minutes > 0) {
      timeParts.push(`Time left ${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    if (remainingSeconds > 0) {
      timeParts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);
    }

    return timeParts.join(' ');
  };

  // Function to update global.moves based on the selected preset
  const updateMovesForPreset = (presetID) => {
    const preset = global.presets.find((p) => p.id === presetID);

    if (preset) {
      global.moves = preset.actuatorValues.map((actuator) => ({
        id: actuator.id,
        name: actuator.name,
        percent: actuator.percent,
      }));
    } else {
      console.error(`Preset with ID ${presetID} not found`);
    }
  };

  
  return (
    <SafeAreaView style={styles.container}>
      {/* Display of Cuelist */}
      <ScrollView style={styles.middle} extraData={updater}>
        {/* "PLAYLISTS" text at the top */}
        <View style={styles.playlistHeader}>
          <Text style={styles.playlistHeaderText}>PLAYLISTS</Text>
        </View>
        {moveList.map((move, index) => (
  <View
    style={[
      styles.presetContainer,
      (index === currentMoveIndex) && styles.currentMove,
      (isLooping && index === currentMoveIndex) && styles.loopingMove,
    ]}
    key={index}
  >
    <TextInput
      style={styles.presetText}
      value={getNameFromID(move.presetID)}
    />
    <TextInput
      style={styles.timeText}
      value={move.time.toString() + " minutes"}
    />
    <TouchableOpacity style={styles.editButton} onPress={() => editMove(index)}>
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  </View>
))}


        {/* Add New Move controls */}
        <View style={styles.newMoveContainer}>
          <Picker
            selectedValue={selectedPreset}
            style={styles.presetPicker}
            onValueChange={(itemValue) => setSelectedPreset(itemValue)}
          >
            {Array.from({ length: global.presets.length }, (_, i) => (
              <Picker.Item key={i} label={global.presets[i].name} value={global.presets[i].id} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedTime}
            style={styles.timePicker}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Picker.Item key={i} label={((i + 1) * 5).toString()} value={((i + 1) * 5)} />
            ))}
          </Picker>
          <TouchableOpacity style={styles.addButton} onPress={addNewMove}>
            <Text style={styles.addButtonText}>ADD NEW MOVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  
      {/* Display timer controls */}
      <View style={styles.bottom}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.playButton} onPress={startTimer}>
            <Ionicons
              name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
              size={36}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.loopButton} onPress={() => setIsLooping(!isLooping)}>
  <Ionicons name="repeat" size={24} color={isLooping ? 'green' : 'black'} />
  <Text style={styles.loopButtonText}>{isLooping ? 'ON' : 'OFF'}</Text>
</TouchableOpacity>


          <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
            <Ionicons name="stop-circle-outline" size={36} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeLeftText}>
          {countdown > 0 ? formatTime(countdown) : 'Timer stopped'}
        </Text>
      </View>
  
      {/* Edit Move */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
    {/* Move Up and Move Down buttons */}
    <View style={styles.modalButtonsContainer}>
      <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveUp(currentMoveIndex)}>
        <Ionicons name="arrow-up" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveDown(currentMoveIndex)}>
        <Ionicons name="arrow-down" size={24} color="black" />
      </TouchableOpacity>
    </View>

      {/* Create Move Error */}
    <Modal isVisible={errorMessage !== ''}>
  <View style={styles.modalContainer}>
    <Text style={styles.errorText}>{errorMessage}</Text>
    <TouchableOpacity style={styles.closeButton} onPress={() => setErrorMessage('')}>
      <Ionicons name="close" size={24} color="black" />
      <Text style={styles.modalButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>


    {/* Time Picker */}
    <Picker
  selectedValue={selectedTime}
  style={styles.edittimePicker}
  onValueChange={(itemValue) => setSelectedTime(itemValue)}
>
  {Array.from({ length: 120 }, (_, i) => (
    <Picker.Item
      key={i}
      label={`${(i + 1)} ${i + 1 === 1 ? 'minute' : 'minutes'}`}  // Adjusted label based on the condition
      value={(i + 1)}
    />
  ))}
</Picker>

    {/* Save and Close buttons */}
    <View style={styles.modalButtonsContainer}>
      <TouchableOpacity style={styles.modalButton} onPress={saveEdit}>
        <Ionicons name="save" size={24} color="green" />
        <Text style={{}}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
        <Ionicons name="close" size={24} color="black" />
        <Text style={styles.modalButtonText}>Close</Text>
      </TouchableOpacity>
    </View>

    {/* DELETE button */}
<TouchableOpacity style={styles.saveButton} onPress={deleteMove}>
  <Ionicons name="trash-outline" size={24} color="red" />
  <Text style={{ color: 'red', marginLeft: -20 }}>Delete</Text>
</TouchableOpacity>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#43B2D1',
  },
  header: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  middle: {
    flex: 2,
    padding: 10,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  currentMove: {
    backgroundColor: 'yellow',
  },
  presetText: {
    fontSize: 18,
    color: 'black',
  },
  timeText: {
    fontSize: 18,
    color: 'black',
  },
  newMoveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  presetPicker: {
    flex: 0.45,
    color: 'black',
    backgroundColor: 'white',
    borderBottomWidth: -20,
    borderBottomColor: 'white',
    borderTopWidth: -20,
    borderTopColor: 'white',
  },
  timePicker: {
    flex: 0.4,
    color: 'black',
    backgroundColor: 'white',
    borderBottomWidth: -20,
    borderBottomColor: 'white',
    borderTopWidth: -20,
    borderTopColor: 'white',
  },
  edittimePicker: {
    flex: 1,
    right: -5,
    color: 'black',
    backgroundColor: 'white',
    borderBottomWidth: -20,
    borderBottomColor: 'white',
    borderTopWidth: -20,
    borderTopColor: 'white',
  },
  addButton: {
    flex: 0.2,
    backgroundColor: '#1C5A7D',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  clearButtonContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  bottom: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: '80%',
    alignSelf: 'center',
  },
  playButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d3d3d3',
  },
  stopButton: {
    flex: 1,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLeftText: {
    marginTop: 5,
    fontSize: 18,
    color: 'white',
  },
  playlistHeader: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  
  playlistHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 25,  // Increase padding for better spacing
    marginBottom: 10,  // Increase marginBottom for better spacing
  },

  // Updated style for the buttons in the modal
  modalButton: {
    marginVertical: 50,  // Adjusted to vertical spacing
  },

  // Updated style for the edit button
  editButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,  // Adjusted to vertical padding
    paddingHorizontal: 20,  // Adjusted to horizontal padding
    borderRadius: 5,
    alignItems: 'center',
  },

  // Updated style for the edit button text
  editButtonText: {
    color: 'black',
    fontSize: 16,
  },

  // Updated style for the close button
  closeButton: {
    marginVertical: 20,  // Adjusted to vertical spacing
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },  
  loopButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d3d3d3',
  },
  loopingMove: {
    backgroundColor: 'yellow',
  }  
});

export default MoveScreen;
