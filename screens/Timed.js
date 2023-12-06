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
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';


const MoveScreen = () => {
  const [moveList, setMoveList] = useState([{ name: 'Preset 1', time: '30' }]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('1');
  const [selectedTime, setSelectedTime] = useState('1');

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

  const startNextMove = () => {
    const nextIndex = currentMoveIndex + 1;
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
      const topMove = moveList[currentMoveIndex];
      const timeInSeconds = countdown > 0 ? countdown : parseInt(topMove.time, 10) * 60;
      setCountdown(timeInSeconds);
      setIsPlaying(true);

      console.log(`Starting Preset: ${topMove.name}`);
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
    const count = selectedPreset;
    const time = selectedTime;

    if (/^\d+$/.test(count) && /^\d+$/.test(time)) {
      const newMove = { name: `Preset ${count}`, time: `${time}` };
      setMoveList([...moveList, newMove]);
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


  const editMove = () => {
    setIsModalVisible(true);
  };

  const moveMoveDown = (index) => {
    if (index < moveList.length - 1) {
      const updatedMoveList = [...moveList];
      const temp = updatedMoveList[index];
      updatedMoveList[index] = updatedMoveList[index + 1];
      updatedMoveList[index + 1] = temp;
      setMoveList(updatedMoveList);
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
      setIsModalVisible(false);
    }
  };



  const saveEdit = () => {
    const updatedMoveList = [...moveList];
    updatedMoveList[currentMoveIndex].name = `Preset ${selectedPreset}`;
    updatedMoveList[currentMoveIndex].time = selectedTime;
    setMoveList(updatedMoveList);
    setIsModalVisible(false);
  };

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
            {Array.from({ length: 30 }, (_, i) => (
              <Picker.Item key={i} label={`Preset ${i + 1}`} value={(i + 1).toString()} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedTime}
            style={styles.timePicker}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
          >
            {Array.from({ length: 1000 }, (_, i) => (
              <Picker.Item key={i} label={(i + 1).toString()} value={(i + 1).toString()} />
            ))}
          </Picker>
          <TouchableOpacity style={styles.addButton} onPress={addNewMove}>
            <Text style={styles.addButtonText}>ADD NEW MOVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            {Array.from({ length: 1000 }, (_, i) => (
              <Picker.Item key={i} label={(i + 1).toString()} value={(i + 1).toString()} />
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
