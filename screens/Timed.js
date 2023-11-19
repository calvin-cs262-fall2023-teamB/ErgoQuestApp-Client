import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const MoveScreen = () => {
  // hooks
  const [moveList, setMoveList] = useState([{ presetID: 1, time: 30 }]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(-1);
  const [selectedTime, setSelectedTime] = useState('1');
  const [updater, setUpdater] = useState(0); // for updating flat list on create

  // refresh
  useEffect(() => {
    let timer;

    if (isPlaying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            startNextMove();
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    } else if (isPlaying && countdown === 0) {
      startNextMove();
    }

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, countdown, currentMoveIndex, moveList]);

  useFocusEffect(() => {
    if (global.times.length !== moveList.length) { // preset deletions leading to shorter moveList
      setMoveList(JSON.parse(JSON.stringify(global.times)));
      setIsPlaying(false);
      // TODO: fix anything else
    }
    return () => {
    }
  });

  // functions
  const startNextMove = () => {
    const nextIndex = currentMoveIndex + 1;
    if (nextIndex < moveList.length) {
      const nextMove = moveList[nextIndex];
      const timeInSeconds = nextMove.time * 60;
      setCurrentMoveIndex(nextIndex);
      setCountdown(timeInSeconds);
      setIsPlaying(true);
      // console.log(`Starting Preset: ${global.preset[nextMove.presetID].name}`);

      // activate move code from presets.js:
      for (let i = 0; i < global.presets.length; i++) {
        if (global.presets[i].id === nextMove.presetID) {
          const moveArray = [];
          for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
            moveArray.push({
              "id": global.presets[i].actuatorValues[j].id,
              "name": global.presets[i].actuatorValues[j].name,
              "percent": global.presets[i].actuatorValues[j].percent,
            })
          }
          global.moves = moveArray;
          // highlight active?
          return;
        }
      }
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

      // console.log(`Starting Preset: ${topMove}`);
    } else {
      setIsPlaying(false);
    }
  };

  const pauseTimer = () => {
    setIsPlaying(false);
  };

  const stopTimer = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
    setCountdown(0);
  };

  const addNewMove = () => {
    global.times.push({ presetID: selectedPreset, time: selectedTime })
    JSON.parse(JSON.stringify(global.times));
    setUpdater(updater + 1);
  };

  const clearMoves = () => {
    setMoveList([]);
    global.times = [];
  };

  const editMove = (index) => {
    setCurrentMoveIndex(index);
    setSelectedPreset(-1);
    setIsModalVisible(true);
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

  const deleteMove = (index) => {
    const updatedMoveList = [...moveList];
    updatedMoveList.splice(index, 1);
    setMoveList(updatedMoveList);
    global.times = JSON.parse(JSON.stringify(updatedMoveList));
    if (index === currentMoveIndex) {
      startNextMove();
    }
    setUpdater(updater + 1);
    setIsModalVisible(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>PLAYLISTS</Text>
      </View>
      {/* Display of Cuelist */}
      <ScrollView style={styles.middle}
        extraData={updater} // allows for immediate re-render when adding new times; otherwise, re-rendered upon screen movement
      >
        {moveList.map((move, index) => (
          <View
            style={[styles.presetContainer, index === currentMoveIndex && styles.currentMove]}
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
          <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveUp(currentMoveIndex)}>
            <Ionicons name="arrow-up" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveDown(currentMoveIndex)}>
            <Ionicons name="arrow-down" size={24} color="black" />
          </TouchableOpacity>

          {/* Time Picker */}
          <Picker
            selectedValue={selectedTime}
            style={styles.edittimePicker}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
          >
            {Array.from({ length: 120 }, (_, i) => (
              <Picker.Item key={i} label={(i + 1).toString()} value={(i + 1)} />
            ))}
          </Picker>
          {/* Save button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
            <Ionicons name="save" size={24} color="green" />
          </TouchableOpacity>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          {/* DELETE button */}
          <TouchableOpacity style={styles.saveButton} onPress={deleteMove}>
            <Text style={{ borderWidth: 2, borderBlockColor: "f00" }} >DELETE</Text>
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
  modalContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: -25,  // Increase padding to add more space
    marginBottom: -10,  // Increase marginBottom to add more space
  },
  modalButton: {
    margin: 10,
  },
  editButton: {
    backgroundColor: 'lightblue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'black',
    fontSize: 16,
  },
  closeButton: {
    margin: 10,
  },
});

export default MoveScreen;
