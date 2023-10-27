import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, TextInput, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function MoveScreen() {
    const [moveList, setMoveList] = useState([{ name: 'Preset 1', time: '30 mins' }]);
    const [newMoveValue, setNewMoveValue] = useState({ count: '1', time: '30' });
    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (isPlaying && countdown <= 0) {
            // Set the countdown to the time of the top new move button
            const topMove = moveList[0];
            if (topMove) {
                const timeInSeconds = parseInt(topMove.time, 10) * 60; // Convert minutes to seconds
                setCountdown(timeInSeconds);
            }
        }
    }, [isPlaying, moveList]);

    const startTimer = () => {
        setIsPlaying(true);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    }

    const addNewMove = () => {
        const { count, time } = newMoveValue;

        if (/^\d+$/.test(count) && /^\d+$/.test(time)) {
            const newMove = { name: `Preset ${count}`, time: `${time} mins` };
            setMoveList([...moveList, newMove]);
            setNewMoveValue({ count: '1', time: '30' });
        } else {
            // Handle invalid input (non-numeric value)
        }
    }

    useEffect(() => {
        let timer;

        if (isPlaying && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }

        return () => {
            clearInterval(timer);
        };
    }, [isPlaying, countdown]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} mins ${remainingSeconds} secs`;
    };

    const updateMoveName = (index, text) => {
        const updatedMoveList = [...moveList];
        updatedMoveList[index].name = text;
        setMoveList(updatedMoveList);
    }

    const updateMoveTime = (index, text) => {
        const updatedMoveList = [...moveList];
        updatedMoveList[index].time = text;
        setMoveList(updatedMoveList);
    }

    const clearMoves = () => {
        setMoveList([]);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.appTitle}>PLAYLISTS</Text>
            </View>

            <ScrollView style={styles.middle}>
                {moveList.map((move, index) => (
                    <View style={styles.presetContainer} key={index}>
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
                    </View>
                ))}
                <View style={styles.newMoveContainer}>
                    <TextInput
                        style={styles.newMoveInput}
                        onChangeText={(text) => setNewMoveValue({ ...newMoveValue, count: text })}
                        value={newMoveValue.count}
                        keyboardType="numeric"
                        placeholder="Preset 1-20"
                        placeholderTextColor="white"
                    />
                    <TextInput
                        style={styles.newMoveInput}
                        onChangeText={(text) => setNewMoveValue({ ...newMoveValue, time: text })}
                        value={newMoveValue.time}
                        keyboardType="numeric"
                        placeholder="1-1000"
                        placeholderTextColor="white"
                    />
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
                    <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                        <Ionicons name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={36} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stopButton}>
                        <Ionicons name="stop-circle-outline" size={36} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.timeLeftText}>
                    {countdown > 0 ? formatTime(countdown) : "Timer stopped"}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#43B2D1'
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
        color: 'white'
    },
    middle: {
        flex: 2,
        padding: 20
    },
    presetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10
    },
    presetText: {
        fontSize: 18,
        color: 'black'
    },
    timeText: {
        fontSize: 18,
        color: 'black'
    },
    newMoveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    newMoveInput: {
        flex: 1,
        fontSize: 18,
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
        fontSize: 18
    },
    clearButtonContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10
    },
    bottom: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        maxWidth: '80%',
        alignSelf: 'center'
    },
    playButton: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d3d3d3'
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
});
