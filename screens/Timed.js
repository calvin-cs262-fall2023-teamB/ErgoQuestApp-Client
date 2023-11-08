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
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

export default function MoveScreen() {
  const [moveList, setMoveList] = useState([{ name: 'Preset 1', time: '30 mins' }]);
  const [newMoveValue, setNewMoveValue] = useState({ count: '1', time: '30' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editMovePreset, setEditMovePreset] = useState('');
  const [editMoveMinutes, setEditMoveMinutes] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('1');
  const [selectedTime, setSelectedTime] = useState('1');

  function formatTime(seconds) {
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
  }

  useEffect(() => {
    if (isPlaying && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    } else if (isPlaying && countdown === 0) {
      startNextMove(); // Start the next move
    }
  }, [isPlaying, countdown, currentMoveIndex, moveList]);

  const editMove = (index) => {
    setEditIndex(index);
    setIsModalVisible(true);
    setEditMovePreset(moveList[index].name);
    setEditMoveMinutes(moveList[index].time);
  };

  const addNewMove = () => {
    const count = selectedPreset;
    const time = selectedTime;

    if (/^\d+$/.test(count) && /^\d+$/.test(time)) {
      const newMove = { name: `Preset ${count}`, time: `${time} mins` };
      setMoveList([...moveList, newMove]);
      setNewMoveValue({ count: '1', time: '30' });
    } else {
      // Handle invalid input (non-numeric value)
    }
  };

  const updateMoveName = (index, text) => {
    const updatedMoveList = [...moveList];
    updatedMoveList[index].name = text;
    setMoveList(updatedMoveList);
  };

  const updateMoveTime = (index, text) => {
    const updatedMoveList = [...moveList];
    updatedMoveList[index].time = text;
    setMoveList(updatedMoveList);
  };

  const clearMoves = () => {
    setMoveList([]);
  };

  const startNextMove = () => {
    const nextIndex = currentMoveIndex;
    if (nextIndex < moveList.length) {
      const nextMove = moveList[nextIndex];
      const timeInSeconds = parseInt(nextMove.time, 10) * 60;
      setCurrentMoveIndex(nextIndex);
      setCountdown(timeInSeconds);
      setIsPlaying(true);

      console.log(`Starting Preset: ${nextMove.name}`);
    } else {
      setIsPlaying(false);
    }
  };

  const startTimer = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      const topMove = moveList[currentMoveIndex];
      const timeInSeconds = parseInt(topMove.time, 10) * 60;
      setCountdown(timeInSeconds);

      console.log(`Starting Preset: ${topMove.name}`);
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

  const moveMoveDown = (index) => {
    if (index < moveList.length - 1) {
      const updatedMoveList = [...moveList];
      const temp = updatedMoveList[index];
      updatedMoveList[index] = updatedMoveList[index + 1];
      updatedMoveList[index + 1] = temp;
      setMoveList(updatedMoveList);
      setEditIndex(-1);
      setIsModalVisible(false);
    }
  };

  const moveMoveUp = (index) => {
    if (index > 0) {
      const updatedMoveList = [...moveList];
      const temp = updatedMoveList[index];
      updatedMoveList[index] = updatedMoveList[index - 1];
      updatedMoveList[index - 1] = temp;
      setMoveList(updatedMoveList);
      setEditIndex(-1);
      setIsModalVisible(false);
    }
  };

  const deleteMove = (index) => {
    const updatedMoveList = [...moveList];
    updatedMoveList.splice(index, 1);
    setMoveList(updatedMoveList);

    if (index === currentMoveIndex) {
      startNextMove();
    }

    setEditIndex(-1);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>PLAYLISTS</Text>
      </View>

      <ScrollView style={styles.middle}>
        {moveList.map((move, index) => (
          <View
            style={[styles.presetContainer, index === currentMoveIndex && styles.currentMove]}
            key={index}
          >
            <TextInput
              style={styles.presetText}
              onChangeText={(text) => updateMoveName(index, text)}
              value={move.name}
            />
            <TextInput
              style={styles.timeText}
              onChangeText={(text) => updateMoveTime(index, text)}
              value={move.time}
            />
            <TouchableOpacity style={styles.editButton} onPress={() => editMove(index)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.newMoveContainer}>
          <Picker
            selectedValue={selectedPreset}
            style={styles.presetPicker}
            onValueChange={(itemValue) => setSelectedPreset(itemValue)}
          >
            {Array.from({ length: 30 }, (_, i) => (i + 1).toString()).map((value) => (
              <Picker.Item key={value} label={value} value={value} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedTime}
            style={styles.timePicker}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
          >
            {Array.from({ length: 1000 }, (_, i) => (i + 1).toString()).map((value) => (
              <Picker.Item key={value} label={value} value={value} />
            ))}
          </Picker>
          <TouchableOpacity style={styles.addButton} onPress={addNewMove}>
            <Text style={styles.addButtonText}>ADD NEW MOVE</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearMoves}>
            <Text style={styles.clearButtonText}>Clear Moves</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.playButton} onPress={startTimer}>
            <Ionicons name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'} size={36} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
            <Ionicons name="stop-circle-outline" size={36} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeLeftText}>
          {countdown > 0 ? formatTime(countdown) : 'Timer stopped'}
        </Text>
      </View>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveUp(editIndex)}>
            <Ionicons name="arrow-up" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => moveMoveDown(editIndex)}>
            <Ionicons name="arrow-down" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => deleteMove(editIndex)}>
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#43B2D1',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  middle: {
    flex: 2,
    padding: 20,
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
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderBottomWidth: 7,
    borderBottomColor: 'white',
    borderTopWidth: 7,
    borderTopColor: 'white',
  },
  timePicker: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderBottomWidth: 7,
    borderBottomColor: 'white',
    borderTopWidth: 7,
    borderTopColor: 'white',
  },
  addButton: {
    backgroundColor: '#1C5A7D',
    padding: 15,
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
    flex: 1,
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
